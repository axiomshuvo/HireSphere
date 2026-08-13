"use client";

import { ArrowUpToLine, MapPin } from "@gravity-ui/icons";
import {
  Button,
  Input,
  InputGroup,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  TextArea,
  Typography,
  useOverlayState,
} from "@heroui/react";

const industries = ["Technology", "Finance", "Healthcare", "Education"];
const employeeRanges = ["1-10 employees", "11-50 employees", "51-200 employees", "201+ employees"];

export default function RegisterCompanyModal({ trigger }) {
  const state = useOverlayState();

  return (
    <>
      <Button variant="primary" onPress={state.open}>
        {trigger}
      </Button>

      <Modal state={state}>
        <Modal.Backdrop variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Register New Company</Modal.Heading>
                <Typography.Paragraph className="text-sm text-muted-foreground">
                  Enter your business details to start hiring on HireLoop.
                </Typography.Paragraph>
              </Modal.Header>

              <Modal.Body>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="e.g. Acme Corp" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="industry">Industry / Category</Label>
                    <Select id="industry" defaultSelectedKey="Technology">
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {industries.map((industry) => (
                            <ListBoxItem key={industry} id={industry} textValue={industry}>
                              {industry}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="website-url">Website URL</Label>
                    <InputGroup>
                      <InputGroup.Prefix>https://</InputGroup.Prefix>
                      <InputGroup.Input id="website-url" placeholder="www.company.com" />
                    </InputGroup>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="location">Location</Label>
                    <InputGroup>
                      <InputGroup.Prefix>
                        <MapPin className="size-4" />
                      </InputGroup.Prefix>
                      <InputGroup.Input id="location" placeholder="City, Country" />
                    </InputGroup>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="employee-count">Employee Count Range</Label>
                    <Select id="employee-count" defaultSelectedKey="1-10 employees">
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {employeeRanges.map((range) => (
                            <ListBoxItem key={range} id={range} textValue={range}>
                              {range}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label>Company Logo</Label>
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-default p-6 text-center">
                      <ArrowUpToLine className="size-6 text-muted-foreground" />
                      <Typography.Paragraph className="font-medium text-white">
                        Upload image
                      </Typography.Paragraph>
                      <Typography.Paragraph className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </Typography.Paragraph>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="description">Brief Description</Label>
                    <TextArea
                      id="description"
                      placeholder="Tell us about your company's mission and culture..."
                      rows={4}
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onPress={state.close}>
                  Cancel
                </Button>
                <Button variant="primary">Register Company</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
