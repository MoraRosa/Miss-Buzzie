import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandHeader from "./BrandHeader";

interface Role {
  id: string;
  title: string;
  department: string;
  responsibilities: string;
  reportsTo: string;
}

const OrgChart = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState({
    title: "",
    department: "",
    responsibilities: "",
    reportsTo: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("orgChart");
    if (saved) {
      setRoles(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("orgChart", JSON.stringify(roles));
    toast({
      title: "Saved successfully",
      description: "Your org chart has been saved",
    });
  };

  const addRole = () => {
    if (!newRole.title) {
      toast({
        title: "Title required",
        description: "Please enter a role title",
        variant: "destructive",
      });
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      ...newRole,
    };

    setRoles([...roles, role]);
    setNewRole({ title: "", department: "", responsibilities: "", reportsTo: "" });
    toast({
      title: "Role added",
      description: "New role has been added to the org chart",
    });
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const getRolesByDepartment = () => {
    const departments: { [key: string]: Role[] } = {};
    roles.forEach((role) => {
      const dept = role.department || "Unassigned";
      if (!departments[dept]) {
        departments[dept] = [];
      }
      departments[dept].push(role);
    });
    return departments;
  };

  const departments = getRolesByDepartment();

  return (
    <div className="space-y-6">
      <BrandHeader />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Organizational Chart</h2>
          <p className="text-muted-foreground mt-2">
            Define your team structure, roles, and reporting relationships
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Role</CardTitle>
          <CardDescription>Create a role for your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Role title (e.g., CEO, Marketing Manager)"
              value={newRole.title}
              onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
            />
            <Input
              placeholder="Department (e.g., Operations, Marketing)"
              value={newRole.department}
              onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
            />
          </div>
          <Input
            placeholder="Reports to (e.g., CEO)"
            value={newRole.reportsTo}
            onChange={(e) => setNewRole({ ...newRole, reportsTo: e.target.value })}
          />
          <Input
            placeholder="Key responsibilities"
            value={newRole.responsibilities}
            onChange={(e) => setNewRole({ ...newRole, responsibilities: e.target.value })}
          />
          <Button onClick={addRole}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(departments).map(([department, deptRoles]) => (
          <Card key={department}>
            <CardHeader>
              <CardTitle>{department}</CardTitle>
              <CardDescription>{deptRoles.length} role(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deptRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{role.title}</h4>
                      {role.reportsTo && (
                        <p className="text-sm text-muted-foreground">
                          Reports to: {role.reportsTo}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {role.responsibilities && (
                    <p className="text-sm text-muted-foreground">
                      {role.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {Object.keys(departments).length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No roles added yet. Create your first role above!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrgChart;
