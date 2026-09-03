const express = require("express");
const { ObjectId } = require("mongodb");

/**
 * HireSphere /api/my/* routes.
 *
 * Auth model: the frontend's server actions call `requireRecruiter()` to
 * resolve the signed-in user's id, then pass it as the `x-recruiter-id`
 * header. This middleware reads that header and exposes it as `req.recruiterId`.
 *
 * Ownership model:
 *   - Company documents carry `recruiterId` (immutable after insert).
 *   - Job documents carry `recruiterId` (denormalized from the parent company
 *     at create time, immutable afterwards).
 *   - All writes verify `doc.recruiterId === req.recruiterId`; mismatches
 *     return 404 (not 403) to avoid leaking existence.
 *   - All writes that arrive with a `recruiterId` in the body strip it and
 *     stamp the session value instead.
 */

function requireRecruiter(req, res, next) {
  const recruiterId = req.headers["x-recruiter-id"];
  if (
    !recruiterId ||
    typeof recruiterId !== "string" ||
    recruiterId.length < 1
  ) {
    return res.status(401).json({ message: "Missing x-recruiter-id header" });
  }
  req.recruiterId = recruiterId;
  next();
}

function buildCompanyLookup(id) {
  const or = [{ companySlug: id }, { companyId: id }];
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    or.push({ _id: new ObjectId(id) });
  }
  return { $or: or };
}

function buildJobLookup(id) {
  const or = [{ jobId: id }, { slug: id }];
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    or.push({ _id: new ObjectId(id) });
  }
  return { $or: or };
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function paginate(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(req.query.pageSize, 10) || 12),
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

async function attachStats(companiesCollection, jobsCollection, companies) {
  const slugs = companies
    .map((c) => c.companySlug ?? c.companyId)
    .filter(Boolean);

  if (slugs.length === 0) {
    return companies.map((c) => ({ ...c, activeJobs: 0 }));
  }

  const counts = await jobsCollection
    .aggregate([
      {
        $match: {
          $or: [{ companySlug: { $in: slugs } }, { companyId: { $in: slugs } }],
          status: "active",
        },
      },
      { $group: { _id: "$companySlug", count: { $sum: 1 } } },
    ])
    .toArray();

  const countsByCompanySlug = Object.fromEntries(
    counts.map((row) => [row._id, row.count]),
  );

  return companies.map((company) => {
    const ref = company.companySlug ?? company.companyId;
    return { ...company, activeJobs: countsByCompanySlug[ref] ?? 0 };
  });
}

// Top-level alias so the public list endpoint can join the same per-company
// active-job counts without re-implementing the aggregation.
async function attachStatsPublic(
  companiesCollection,
  jobsCollection,
  companies,
) {
  return attachStats(companiesCollection, jobsCollection, companies);
}

function mountMyRoutes(app, database) {
  const companiesCollection = database.collection("companies");
  const jobsCollection = database.collection("jobs");
  const applicationsCollection = database.collection("applications");
  const savedJobsCollection = database.collection("savedJobs");
  const usersCollection = database.collection("user");
  const router = express.Router();

  async function attachApplicantCounts(jobs) {
    return Promise.all(
      jobs.map(async (job) => {
        const jobIds = [
          job.jobId,
          job.slug,
          job._id ? String(job._id) : null,
        ].filter(Boolean);
        const applicants = jobIds.length
          ? await applicationsCollection.countDocuments({
              jobId: { $in: jobIds },
            })
          : 0;
        return { ...job, applicants };
      }),
    );
  }

  function requireRole(role, message) {
    return async (req, res, next) => {
      if (!ObjectId.isValid(req.recruiterId)) {
        return res.status(401).json({ message: "Invalid user identity" });
      }
      try {
        const user = await usersCollection.findOne({
          _id: new ObjectId(req.recruiterId),
        });
        if (!user) return res.status(401).json({ message: "Unknown user" });
        if (user.role !== role) return res.status(403).json({ message });
        return next();
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Unable to validate user", error: error.message });
      }
    };
  }

  const requireRecruiterRole = requireRole(
    "recruiter",
    "Only recruiters can access this resource",
  );
  const requireSeekerRole = requireRole(
    "seeker",
    "Only job seekers can access saved jobs",
  );

  router.use(requireRecruiter);
  router.use("/companies", requireRecruiterRole);
  router.use("/jobs", requireRecruiterRole);
  router.use("/applicants", requireRecruiterRole);
  router.use("/saved-jobs", requireSeekerRole);

  // ─── Companies ──────────────────────────────────────────────────────

  // GET /api/my/companies — paginated list of the recruiter's companies.
  router.get("/companies", async (req, res) => {
    try {
      const { page, pageSize, skip } = paginate(req);
      const filter = { recruiterId: req.recruiterId };
      const [items, total] = await Promise.all([
        companiesCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray(),
        companiesCollection.countDocuments(filter),
      ]);
      const withStats = await attachStats(
        companiesCollection,
        jobsCollection,
        items,
      );
      res.json({
        items: withStats,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching companies", error: error.message });
    }
  });

  // GET /api/my/companies/stats
  router.get("/companies/stats", async (req, res) => {
    try {
      const total = await companiesCollection.countDocuments({
        recruiterId: req.recruiterId,
      });
      res.json({ total });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching stats", error: error.message });
    }
  });

  // GET /api/my/companies/:id
  router.get("/companies/:id", async (req, res) => {
    try {
      const company = await companiesCollection.findOne({
        ...buildCompanyLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!company)
        return res.status(404).json({ message: "Company not found" });
      res.json(company);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching company", error: error.message });
    }
  });

  // POST /api/my/companies
  router.post("/companies", async (req, res) => {
    try {
      const { _id, id, recruiterId: _stripped, ...rest } = req.body ?? {};
      const doc = {
        ...rest,
        recruiterId: req.recruiterId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await companiesCollection.insertOne(doc);
      const inserted = await companiesCollection.findOne({
        _id: result.insertedId,
      });
      res.status(201).json({ company: inserted });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating company", error: error.message });
    }
  });

  // PUT /api/my/companies/:id
  router.put("/companies/:id", async (req, res) => {
    try {
      const {
        _id,
        id,
        recruiterId: _stripped,
        createdAt: _created,
        ...rest
      } = req.body ?? {};
      const existing = await companiesCollection.findOne({
        ...buildCompanyLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!existing)
        return res.status(404).json({ message: "Company not found" });

      const oldRef = existing.companySlug ?? existing.companyId;
      const newRef = rest.companySlug ?? existing.companySlug;
      const slugChanged = Boolean(oldRef && newRef && oldRef !== newRef);

      const updateDoc = { ...rest, updatedAt: new Date().toISOString() };
      const result = await companiesCollection.findOneAndUpdate(
        { ...buildCompanyLookup(req.params.id), recruiterId: req.recruiterId },
        { $set: updateDoc },
        { returnDocument: "after" },
      );
      if (!result)
        return res.status(404).json({ message: "Company not found" });

      let closedJobs = 0;
      if (slugChanged) {
        const close = await jobsCollection.updateMany(
          {
            $or: [{ companySlug: oldRef }, { companyId: oldRef }],
            status: "active",
            recruiterId: req.recruiterId,
          },
          {
            $set: {
              status: "closed",
              isPublicVisible: false,
              closedAt: new Date().toISOString(),
              closedReason: "company-renamed",
              previousCompanySlug: oldRef,
              updatedAt: new Date().toISOString(),
            },
          },
        );
        closedJobs = close.modifiedCount ?? 0;
      }

      res.json({ company: result, closedJobs });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating company", error: error.message });
    }
  });

  // DELETE /api/my/companies/:id
  router.delete("/companies/:id", async (req, res) => {
    try {
      const result = await companiesCollection.findOneAndDelete({
        ...buildCompanyLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!result)
        return res.status(404).json({ message: "Company not found" });

      const companyRef =
        result.companySlug ?? result.companyId ?? req.params.id;
      const jobsResult = await jobsCollection.updateMany(
        {
          $or: [{ companySlug: companyRef }, { companyId: companyRef }],
          status: "active",
          recruiterId: req.recruiterId,
        },
        { $set: { status: "closed", closedAt: new Date().toISOString() } },
      );
      res.json({
        message: "Company deleted",
        closedJobs: jobsResult.modifiedCount,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting company", error: error.message });
    }
  });

  // ─── Jobs ───────────────────────────────────────────────────────────

  // GET /api/my/jobs
  router.get("/jobs", async (req, res) => {
    try {
      const { page, pageSize, skip } = paginate(req);
      const filter = { recruiterId: req.recruiterId };
      if (req.query.status) filter.status = req.query.status;

      const [rawItems, total] = await Promise.all([
        jobsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray(),
        jobsCollection.countDocuments(filter),
      ]);
      const items = await attachApplicantCounts(rawItems);
      res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching jobs", error: error.message });
    }
  });

  // GET /api/my/jobs/stats
  router.get("/jobs/stats", async (req, res) => {
    try {
      const filter = { recruiterId: req.recruiterId };
      const [total, active, closed, myJobs] = await Promise.all([
        jobsCollection.countDocuments(filter),
        jobsCollection.countDocuments({ ...filter, status: "active" }),
        jobsCollection.countDocuments({ ...filter, status: "closed" }),
        jobsCollection
          .find(filter, { projection: { jobId: 1, slug: 1, _id: 1 } })
          .toArray(),
      ]);
      const jobIds = myJobs.flatMap((job) =>
        [job.jobId, job.slug, job._id ? String(job._id) : null].filter(Boolean),
      );
      const applicantsTotal = jobIds.length
        ? await applicationsCollection.countDocuments({
            jobId: { $in: jobIds },
          })
        : 0;
      res.json({
        total,
        active,
        closed,
        applicantsTotal,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching stats", error: error.message });
    }
  });

  router.get("/applicants", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.pageSize, 10) || 20),
      );

      const myJobs = await jobsCollection
        .find(
          { recruiterId: req.recruiterId },
          { projection: { jobId: 1, slug: 1, _id: 1 } },
        )
        .toArray();
      const allowedIds = new Set();
      for (const job of myJobs) {
        if (job.jobId) allowedIds.add(job.jobId);
        if (job.slug) allowedIds.add(job.slug);
        if (job._id) allowedIds.add(String(job._id));
      }
      if (allowedIds.size === 0) {
        return res.json({
          items: [],
          total: 0,
          totalPages: 0,
          page,
          pageSize,
        });
      }

      const filter = { jobId: { $in: Array.from(allowedIds) } };
      if (req.query.jobId) {
        if (!allowedIds.has(req.query.jobId)) {
          return res.status(404).json({ message: "Job not found" });
        }
        filter.jobId = req.query.jobId;
      }

      const [items, total] = await Promise.all([
        applicationsCollection
          .find(filter)
          .sort({ appliedAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        applicationsCollection.countDocuments(filter),
      ]);
      res.json({
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        page,
        pageSize,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching applicants", error: error.message });
    }
  });

  // GET /api/my/applicants/:id — fetch one applicant owned by this recruiter.
  router.get("/applicants/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: "Application not found" });
      }
      const application = await applicationsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const job = await jobsCollection.findOne({
        ...buildJobLookup(application.jobId),
        recruiterId: req.recruiterId,
      });
      if (!job) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json({ application });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching application", error: error.message });
    }
  });

  // GET /api/my/jobs/:id
  router.get("/jobs/:id", async (req, res) => {
    try {
      const job = await jobsCollection.findOne({
        ...buildJobLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!job) return res.status(404).json({ message: "Job not found" });
      const applicants = await applicationsCollection.countDocuments({
        jobId: {
          $in: [job.jobId, job.slug, String(job._id)].filter(Boolean),
        },
      });
      res.json({ ...job, applicants });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching job", error: error.message });
    }
  });

  // POST /api/my/jobs
  router.post("/jobs", async (req, res) => {
    try {
      const { _id, id, recruiterId: _stripped, ...rest } = req.body ?? {};
      const companyRef = rest.companySlug ?? rest.companyId;
      if (!companyRef) {
        return res.status(400).json({ message: "companySlug is required" });
      }
      const company = await companiesCollection.findOne({
        ...buildCompanyLookup(companyRef),
        recruiterId: req.recruiterId,
      });
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const doc = {
        ...rest,
        companySlug: company.companySlug ?? company.companyId,
        recruiterId: req.recruiterId,
        status: rest.status ?? "active",
        applicants: rest.applicants ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await jobsCollection.insertOne(doc);
      const inserted = await jobsCollection.findOne({ _id: result.insertedId });
      res.status(201).json({ job: inserted });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating job", error: error.message });
    }
  });

  // PUT /api/my/jobs/:id
  router.put("/jobs/:id", async (req, res) => {
    try {
      const {
        _id,
        id,
        recruiterId: _stripped,
        createdAt: _created,
        ...rest
      } = req.body ?? {};
      const result = await jobsCollection.findOneAndUpdate(
        { ...buildJobLookup(req.params.id), recruiterId: req.recruiterId },
        { $set: { ...rest, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
      );
      if (!result) return res.status(404).json({ message: "Job not found" });
      res.json({ job: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating job", error: error.message });
    }
  });

  // PATCH /api/my/jobs/:id/status
  router.patch("/jobs/:id/status", async (req, res) => {
    try {
      const { status } = req.body ?? {};
      if (!["active", "closed", "draft"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const job = await jobsCollection.findOne({
        ...buildJobLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!job) return res.status(404).json({ message: "Job not found" });

      if (status === "active") {
        const companyRef = job.companySlug ?? job.companyId;
        if (!companyRef) {
          return res.status(400).json({
            message: "Cannot activate a job that has no company.",
          });
        }
        const company = await companiesCollection.findOne(
          buildCompanyLookup(companyRef),
        );
        if (!company) {
          return res.status(400).json({
            message: "Cannot activate a job whose company no longer exists.",
          });
        }
      }

      const result = await jobsCollection.findOneAndUpdate(
        { ...buildJobLookup(req.params.id), recruiterId: req.recruiterId },
        {
          $set: {
            status,
            updatedAt: new Date().toISOString(),
            ...(status === "active"
              ? { reopenedAt: new Date().toISOString() }
              : { closedAt: new Date().toISOString() }),
          },
        },
        { returnDocument: "after" },
      );
      res.json({ job: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating status", error: error.message });
    }
  });

  // DELETE /api/my/jobs/:id
  router.delete("/jobs/:id", async (req, res) => {
    try {
      const result = await jobsCollection.findOneAndDelete({
        ...buildJobLookup(req.params.id),
        recruiterId: req.recruiterId,
      });
      if (!result) return res.status(404).json({ message: "Job not found" });
      res.json({ message: "Job deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting job", error: error.message });
    }
  });

  // GET /api/my/saved-jobs — paginated list of the user's saved jobs.
  router.get("/saved-jobs", async (req, res) => {
    try {
      const { page, pageSize, skip } = paginate(req);
      const filter = { userId: req.recruiterId };
      const [items, total] = await Promise.all([
        savedJobsCollection
          .find(filter)
          .sort({ savedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray(),
        savedJobsCollection.countDocuments(filter),
      ]);
      res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching saved jobs", error: error.message });
    }
  });

  // POST /api/my/saved-jobs — save a job.
  router.post("/saved-jobs", async (req, res) => {
    try {
      const { jobId, title, companySlug } = req.body ?? {};
      if (!jobId) return res.status(400).json({ message: "jobId is required" });
      if (!req.recruiterId) {
        return res.status(401).json({ message: "Missing authentication" });
      }

      const existing = await savedJobsCollection.findOne({
        userId: req.recruiterId,
        jobId,
      });
      if (existing) {
        return res.status(200).json({ alreadySaved: true, savedJob: existing });
      }

      const doc = {
        userId: req.recruiterId,
        jobId,
        title: title || null,
        companySlug: companySlug || null,
        savedAt: new Date().toISOString(),
      };
      const result = await savedJobsCollection.insertOne(doc);
      const savedJob = await savedJobsCollection.findOne({
        _id: result.insertedId,
      });
      res.status(201).json({ savedJob });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving job", error: error.message });
    }
  });

  // DELETE /api/my/saved-jobs/:jobId — remove a saved job.
  router.delete("/saved-jobs/:jobId", async (req, res) => {
    try {
      const result = await savedJobsCollection.findOneAndDelete({
        userId: req.recruiterId,
        jobId: req.params.jobId,
      });
      if (!result)
        return res.status(404).json({ message: "Saved job not found" });
      res.json({ message: "Saved job removed" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error removing saved job", error: error.message });
    }
  });

  app.use("/api/my", router);
}

/**
 * Public enhancements to the existing /api/companies and /api/jobs routes.
 * Mounted after the originals so we keep their behavior; this just adds
 * pagination + filter support that the originals lacked.
 */
function mountPublicEnhancements(app, database) {
  const companiesCollection = database.collection("companies");
  const jobsCollection = database.collection("jobs");

  // GET /api/companies — public, paginated, optionally with isPublicVisible filter.
  app.get("/api/companies", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.pageSize, 10) || 12),
      );
      const filter = {};
      if (req.query.isPublicVisible === "true") filter.isPublicVisible = true;
      const [rawItems, total] = await Promise.all([
        companiesCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        companiesCollection.countDocuments(filter),
      ]);
      const items = await attachStatsPublic(
        companiesCollection,
        jobsCollection,
        rawItems,
      );
      res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching companies", error: error.message });
    }
  });

  // GET /api/companies/:id — public detail, returns company + its active jobs.
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await companiesCollection.findOne(
        buildCompanyLookup(req.params.id),
      );
      if (!company)
        return res.status(404).json({ message: "Company not found" });

      const companyRef =
        company.companySlug ?? company.companyId ?? req.params.id;
      const activeJobs = await jobsCollection
        .find({
          $or: [{ companySlug: companyRef }, { companyId: companyRef }],
          status: "active",
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      res.json({ ...company, activeJobs });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching company", error: error.message });
    }
  });

  // GET /api/jobs — public, paginated, with optional filters.
  app.get("/api/jobs", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.pageSize, 10) || 12),
      );

      const filter = { status: "active", isPublicVisible: { $ne: false } };
      if (req.query.category) filter.category = req.query.category;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.remote === "true") filter.remote = true;
      if (req.query.location) {
        const re = new RegExp(escapeRegex(req.query.location), "i");
        filter.$or = [{ city: re }, { country: re }];
      }
      if (req.query.search) {
        const re = new RegExp(escapeRegex(req.query.search), "i");
        const searchOr = [{ title: re }, { description: re }];
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
          delete filter.$or;
        } else {
          filter.$or = searchOr;
        }
      }
      const companyFilters = [];
      if (req.query.companySlug)
        companyFilters.push({ companySlug: req.query.companySlug });
      if (req.query.companyId)
        companyFilters.push({ companyId: req.query.companyId });
      if (companyFilters.length === 1) Object.assign(filter, companyFilters[0]);
      else if (companyFilters.length > 1) {
        filter.$and = filter.$and
          ? [...filter.$and, ...companyFilters]
          : companyFilters;
      }

      const [items, total] = await Promise.all([
        jobsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        jobsCollection.countDocuments(filter),
      ]);
      res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching jobs", error: error.message });
    }
  });

  // GET /api/jobs/:id — accept slug, jobId, or _id.
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await jobsCollection.findOne({
        ...buildJobLookup(req.params.id),
        status: "active",
        isPublicVisible: { $ne: false },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching job", error: error.message });
    }
  });

  // GET /api/plans — public subscription plans
  app.get("/api/plans", async (req, res) => {
    try {
      const plansCollection = database.collection("plans");
      const { role } = req.query;
      const filter = { isActive: { $ne: false } };
      if (role) {
        filter.role = String(role).toLowerCase().trim();
      }

      const plans = await plansCollection
        .find(filter)
        .sort({ tierOrder: 1 })
        .toArray();

      res.json(plans);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching plans", error: error.message });
    }
  });
}

module.exports = { mountMyRoutes, mountPublicEnhancements };
