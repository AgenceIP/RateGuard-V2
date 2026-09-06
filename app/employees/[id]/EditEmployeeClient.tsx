"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EmployeeForm, type EmployeeFormValues } from "@/components/EmployeeForm";
import { Button } from "@/components/ui/button";
import { deleteEmployee, setEmployeeActive, updateEmployee } from "@/app/employees/actions";
import type { Employee } from "@/lib/types";

export function EditEmployeeClient({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSubmit(values: EmployeeFormValues) {
    return updateEmployee(employee.id, values);
  }

  function handleDelete() {
    if (!confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteEmployee(employee.id);
      router.push("/employees");
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      await setEmployeeActive(employee.id, !employee.active);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <EmployeeForm initial={employee} onSubmit={handleSubmit} submitLabel="Save" />
      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={handleToggleActive} disabled={pending}>
          {employee.active ? "Mark inactive" : "Mark active"}
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
          Delete
        </Button>
      </div>
    </div>
  );
}
