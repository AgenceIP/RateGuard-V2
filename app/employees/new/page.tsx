"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm, type EmployeeFormValues } from "@/components/EmployeeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmployee } from "@/app/employees/actions";

export default function NewEmployeePage() {
  const router = useRouter();

  async function handleSubmit(values: EmployeeFormValues) {
    const result = await createEmployee(values);
    if (!result?.error) router.push("/employees");
    return result;
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Add an employee or contractor</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm onSubmit={handleSubmit} submitLabel="Ajouter" />
        </CardContent>
      </Card>
    </div>
  );
}
