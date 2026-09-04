import {
  Briefcase,
  CircleCheck,
  CircleXmark,
  Clock,
  Globe,
  GraduationCap,
  Layers,
  Pencil,
  Play,
  Tag,
} from "@gravity-ui/icons";

const TYPE_META = {
  "Full-time": {
    color: "indigo",
    icon: Briefcase,
    label: "Full-time",
    description: "Permanent salaried role with benefits.",
  },
  "Part-time": {
    color: "sky",
    icon: Clock,
    label: "Part-time",
    description: "Fewer than 30 hours per week.",
  },
  Contract: {
    color: "amber",
    icon: Pencil,
    label: "Contract",
    description: "Fixed-term engagement, often project-based.",
  },
  Internship: {
    color: "emerald",
    icon: GraduationCap,
    label: "Internship",
    description: "Early-career learning opportunity.",
  },
};

const CATEGORY_META = {
  Technology: { color: "indigo", icon: Layers },
  Engineering: { color: "cyan", icon: Layers },
  Finance: { color: "emerald", icon: Layers },
  Healthcare: { color: "rose", icon: Layers },
  Education: { color: "amber", icon: Layers },
  Marketing: { color: "fuchsia", icon: Layers },
  Design: { color: "pink", icon: Layers },
  Sales: { color: "lime", icon: Pencil },
};

const STATUS_META = {
  active: {
    color: "emerald",
    icon: CircleCheck,
    label: "Active",
    description:
      "This job is visible on the public board and accepting applications.",
  },
  draft: {
    color: "amber",
    icon: Tag,
    label: "Draft",
    description: "Not published yet. Only you can see it.",
  },
  closed: {
    color: "red",
    icon: CircleXmark,
    label: "Closed",
    description: "No longer accepting applications.",
  },
};

const COLOR_CLASSES = {
  indigo: "bg-indigo-500/15 text-indigo-200 border-indigo-400/30",
  sky: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  amber: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  rose: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30",
  pink: "bg-pink-500/15 text-pink-200 border-pink-400/30",
  cyan: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  lime: "bg-lime-500/15 text-lime-200 border-lime-400/30",
  red: "bg-red-500/15 text-red-200 border-red-400/30",
  purple: "bg-purple-500/15 text-purple-200 border-purple-400/30",
};

function BadgeShell({
  color,
  Icon,
  label,
  title,
  size = "sm",
  className = "",
}) {
  const tone = COLOR_CLASSES[color] ?? COLOR_CLASSES.indigo;
  const sizing =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px] gap-1"
      : "px-2 py-0.5 text-[11px] gap-1";
  return (
    <span
      title={title}
      aria-label={title ?? label}
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wider ${tone} ${sizing} ${className}`}
    >
      <Icon className="size-3 shrink-0" />
      {label}
    </span>
  );
}

function lookup(map, value, fallback) {
  if (!value) return null;
  return (
    map[value] ??
    fallback ?? { color: "indigo", icon: Tag, label: String(value) }
  );
}

export function JobTypeBadge({ type, size = "sm", className = "" }) {
  const meta = lookup(TYPE_META, type);
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <BadgeShell
      color={meta.color}
      Icon={Icon}
      label={meta.label}
      title={`${meta.label} — ${meta.description}`}
      size={size}
      className={className}
    />
  );
}

export function JobCategoryBadge({ category, size = "sm", className = "" }) {
  const meta = lookup(CATEGORY_META, category, {
    color: "indigo",
    icon: Tag,
    label: category,
    description: "",
  });
  const Icon = meta.icon;
  return (
    <BadgeShell
      color={meta.color}
      Icon={Icon}
      label={meta.label}
      title={`Category — ${meta.label}`}
      size={size}
      className={className}
    />
  );
}

export function JobStatusBadge({ status, size = "sm", className = "" }) {
  const meta = lookup(STATUS_META, status);
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <BadgeShell
      color={meta.color}
      Icon={Icon}
      label={meta.label}
      title={meta.description}
      size={size}
      className={className}
    />
  );
}

export function JobRemoteBadge({ remote, size = "sm", className = "" }) {
  if (!remote) return null;
  return (
    <BadgeShell
      color="purple"
      Icon={Globe}
      label="Remote"
      title="Fully remote — work from anywhere."
      size={size}
      className={className}
    />
  );
}

export function JobWorkplaceBadge({ type, size = "sm", className = "" }) {
  if (!type) return null;
  let color = "indigo";
  let label = type;
  if (type === "Remote") color = "purple";
  if (type === "Hybrid") color = "sky";
  if (type === "On-site") color = "amber";

  return (
    <BadgeShell
      color={color}
      Icon={Globe}
      label={label}
      title={`Workplace Type — ${label}`}
      size={size}
      className={className}
    />
  );
}

export function JobExperienceBadge({ level, size = "sm", className = "" }) {
  if (!level) return null;
  let color = "indigo";
  if (level === "Senior" || level === "Lead" || level === "Executive")
    color = "rose";
  if (level === "Entry-level" || level === "Internship") color = "emerald";

  return (
    <BadgeShell
      color={color}
      Icon={Tag}
      label={level}
      title={`Experience Level — ${level}`}
      size={size}
      className={className}
    />
  );
}

export function JobHiringBadge({ size = "sm", className = "" }) {
  return (
    <BadgeShell
      color="emerald"
      Icon={Play}
      label="Hiring"
      title="This company is actively hiring right now."
      size={size}
      className={className}
    />
  );
}

export const JOB_BADGE_META = {
  type: TYPE_META,
  category: CATEGORY_META,
  status: STATUS_META,
};
