"use client"
import { Button, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function Cart(){
    const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        {/* Modal content */}
      </Modal>

      <Group>
        <Button onClick={open}>Open modal</Button>
      </Group>
    </>
  );
}