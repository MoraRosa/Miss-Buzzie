import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, Edit, Eye, Download, FileImage, FileText, Loader2, User, X, ImageIcon, LayoutList, Network, Search, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import BrandHeader from "./BrandHeader";
import OrgChartPreview from "./OrgChartPreview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { exportOrgChartAsPNG, exportOrgChartAsPDF } from "@/lib/orgChartExport";
import { getAssets } from "@/lib/assetManager";
import { OrgChartDataSchema } from "@/lib/validators/schemas";

interface Role {
  id: string;
  title: string;
  name: string; // Employee name
  department: string;
  responsibilities: string;
  reportsTo: string;
  photoAssetId?: string; // Reference to Brand Manager asset ID (not full data URL!)
  bio: string; // Professional bio for investor decks
  linkedinUrl: string; // LinkedIn profile URL
}

// Type for old data format during migration
interface LegacyRole extends Partial<Role> {
  photoUrl?: string;
}

// Migration function for old data format
const migrateOrgChartData = (data: Role[]): Role[] => {
  return data.map((role: LegacyRole) => ({
    id: role.id || `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: role.title || "",
    name: role.name || "",
    department: role.department || "",
    responsibilities: role.responsibilities || "",
    reportsTo: role.reportsTo || "",
    // Migrate from photoUrl to photoAssetId (remove full base64 data!)
    photoAssetId: role.photoAssetId || "",
    bio: role.bio || "",
    linkedinUrl: role.linkedinUrl || "",
  }));
};

const OrgChart = () => {
  const { toast } = useToast();

  // Use validated localStorage hook with auto-save and migration
  const [roles, setRoles, { save }] = useLocalStorage<Role[]>(
    "orgChart",
    [],
    {
      schema: OrgChartDataSchema,
      debounceMs: 300,
      migrate: migrateOrgChartData,
    }
  );

  const [newRole, setNewRole] = useState({
    title: "",
    name: "",
    department: "",
    responsibilities: "",
    reportsTo: "",
    photoAssetId: "",
    bio: "",
    linkedinUrl: "",
  });
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isExporting, setIsExporting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState<"vertical" | "horizontal">("vertical");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to get photo URL from asset ID
  const getPhotoUrl = (assetId?: string): string | undefined => {
    if (!assetId) return undefined;
    const assets = getAssets();
    const asset = assets.find(a => a.id === assetId);
    return asset?.dataUrl;
  };

  const handleSave = () => {
    save();
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

    if (editingRole) {
      // Update existing role
      setRoles(roles.map(r => r.id === editingRole.id ? { ...editingRole, ...newRole } : r));
      setEditingRole(null);
      toast({
        title: "Role updated",
        description: "Role has been updated successfully",
      });
    } else {
      // Add new role
      const role: Role = {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...newRole,
      };
      setRoles([...roles, role]);
      toast({
        title: "Role added",
        description: "New role has been added to the org chart",
      });
    }

    setNewRole({ title: "", name: "", department: "", responsibilities: "", reportsTo: "", photoAssetId: "", bio: "", linkedinUrl: "" });
  };

  const startEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      title: role.title,
      name: role.name,
      department: role.department,
      responsibilities: role.responsibilities,
      reportsTo: role.reportsTo,
      photoAssetId: role.photoAssetId || "",
      bio: role.bio || "",
      linkedinUrl: role.linkedinUrl || "",
    });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setNewRole({ title: "", name: "", department: "", responsibilities: "", reportsTo: "", photoAssetId: "", bio: "", linkedinUrl: "" });
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const getRolesByDepartment = () => {
    const departments: { [key: string]: Role[] } = {};
    const deptNameMap: { [key: string]: string } = {}; // Maps lowercase dept name to original display name

    // Filter roles based on search query
    const filteredRoles = roles.filter(role => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        role.title.toLowerCase().includes(query) ||
        role.name.toLowerCase().includes(query) ||
        role.department.toLowerCase().includes(query) ||
        role.responsibilities.toLowerCase().includes(query) ||
        role.reportsTo.toLowerCase().includes(query)
      );
    });

    filteredRoles.forEach((role) => {
      const originalDept = role.department || "Unassigned";
      const deptKey = originalDept.toLowerCase(); // Normalize to lowercase for grouping

      // Use the first occurrence's capitalization as the display name
      if (!deptNameMap[deptKey]) {
        deptNameMap[deptKey] = originalDept;
      }

      const displayDept = deptNameMap[deptKey];
      if (!departments[displayDept]) {
        departments[displayDept] = [];
      }
      departments[displayDept].push(role);
    });
    return departments;
  };

  const handleExportPNG = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview Mode",
        description: "Please switch to Preview mode to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportOrgChartAsPNG();
      toast({
        title: "Export successful",
        description: "Org chart exported as PNG",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export org chart as PNG",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview Mode",
        description: "Please switch to Preview mode to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportOrgChartAsPDF();
      toast({
        title: "Export successful",
        description: "Org chart exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export org chart as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };



  const departments = getRolesByDepartment();

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Organizational Chart</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Define your team structure, roles, and reporting relationships
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
            >
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>

          {/* Layout Style Toggle (only show in preview mode) */}
          {viewMode === "preview" && (
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={layoutStyle === "vertical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayoutStyle("vertical")}
                title="Top-Down Layout (Hierarchical Tree)"
              >
                <Network className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutStyle === "horizontal" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayoutStyle("horizontal")}
                title="Left-to-Right Layout"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none" disabled={isExporting || roles.length === 0}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPNG}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Save Button */}
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {viewMode === "edit" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{editingRole ? "Edit Role" : "Add New Role"}</CardTitle>
              <CardDescription>
                {editingRole ? "Update role information" : "Create a role for your organization"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Role title (e.g., CEO, Marketing Manager)"
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                />
                <Input
                  placeholder="Employee name (e.g., John Smith)"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Department (e.g., Operations, Marketing)"
                  value={newRole.department}
                  onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                />
                <Input
                  placeholder="Reports to (e.g., CEO)"
                  value={newRole.reportsTo}
                  onChange={(e) => setNewRole({ ...newRole, reportsTo: e.target.value })}
                />
              </div>
              <Input
                placeholder="Key responsibilities"
                value={newRole.responsibilities}
                onChange={(e) => setNewRole({ ...newRole, responsibilities: e.target.value })}
              />

              {/* Bio - for investor-ready documentation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Bio (for investor deck)</label>
                <Textarea
                  placeholder="e.g., 10+ years in fintech, previously VP at Stripe, Stanford MBA. Led product launches reaching 2M+ users..."
                  value={newRole.bio}
                  onChange={(e) => setNewRole({ ...newRole, bio: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn Profile URL</label>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={newRole.linkedinUrl}
                    onChange={(e) => setNewRole({ ...newRole, linkedinUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Photo Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee Photo (optional)</label>
                <div className="flex items-center gap-2">
                  {newRole.photoAssetId && getPhotoUrl(newRole.photoAssetId) && (
                    <div className="relative">
                      <img
                        src={getPhotoUrl(newRole.photoAssetId)}
                        alt="Employee"
                        className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                      <button
                        onClick={() => setNewRole({ ...newRole, photoAssetId: "" })}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPhotoSelector(true)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {newRole.photoAssetId ? "Change Photo" : "Select Photo from Brand Assets"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addRole}>
                  {editingRole ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Role
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </>
                  )}
                </Button>
                {editingRole && (
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search/Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles by title, name, department, or responsibilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {Object.values(departments).flat().length} role(s) matching "{searchQuery}"
                </p>
              )}
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
                      <div className="flex items-start gap-3">
                        {/* Employee Photo */}
                        {role.photoAssetId && getPhotoUrl(role.photoAssetId) ? (
                          <img
                            src={getPhotoUrl(role.photoAssetId)}
                            alt={role.name || role.title}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg">{role.title}</h4>
                          {role.name && (
                            <p className="text-sm text-muted-foreground font-medium">
                              {role.name}
                            </p>
                          )}
                          {role.reportsTo && (
                            <p className="text-sm text-muted-foreground">
                              Reports to: {role.reportsTo}
                            </p>
                          )}
                          {role.responsibilities && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {role.responsibilities}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditRole(role)}
                            aria-label={`Edit ${role.title} role`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRole(role.id)}
                            aria-label={`Remove ${role.title} role`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
        </>
      ) : (
        <OrgChartPreview roles={roles} layoutStyle={layoutStyle} />
      )}

      {/* Photo Selector Dialog */}
      <Dialog open={showPhotoSelector} onOpenChange={setShowPhotoSelector}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Employee Photo</DialogTitle>
            <DialogDescription>
              Choose a photo from your Brand Assets
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {getAssets()
              .filter(asset => asset.type === 'image')
              .map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    setNewRole({ ...newRole, photoAssetId: asset.id });
                    setShowPhotoSelector(false);
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                >
                  <img
                    src={asset.dataUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            {getAssets().filter(asset => asset.type === 'image').length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No images in Brand Assets. Upload images in the Brand Manager first.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrgChart;
