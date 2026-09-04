"use client";

import { TrashBin } from "@gravity-ui/icons";
import { Button, Modal, Typography, useOverlayState } from "@heroui/react";
import { toast } from "@heroui/react";

export default function DeleteJobDialog({ job, onConfirm }) {
  const state = useOverlayState();

  const handleConfirm = () => {
    onConfirm?.(job);
    state.close();
    toast.danger("Job deleted", {
      description: `${job.title} was removed from your job posts.`,
    });
  };

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="text-muted-foreground hover:text-danger"
        aria-label={`Delete ${job.title}`}
        onPress={state.open}
      >
        <TrashBin className="size-4" />
      </Button>

      <Modal state={state}>
        <Modal.Backdrop variant="blur">
          <Modal.Container placement="center" size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Delete job post?</Modal.Heading>
                <Typography.Paragraph className="text-sm text-muted-foreground">
                  This will permanently remove <span className="font-medium text-foreground">{job.title}</span>.
                </Typography.Paragraph>
              </Modal.Header>

              <Modal.Footer>
                <Button variant="secondary" onPress={state.close}>
                  Cancel
                </Button>
                <Button variant="danger" onPress={handleConfirm}>
                  Delete Job
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
