import { useEffect, useState } from "react";
import { getBrandColors, getAssets } from "@/lib/assetManager";
import { User } from "lucide-react";

interface Role {
  id: string;
  title: string;
  name: string;
  department: string;
  responsibilities: string;
  reportsTo: string;
  photoAssetId?: string;
}

interface OrgChartPreviewProps {
  roles: Role[];
  layoutStyle?: "vertical" | "horizontal";
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

const OrgChartPreview = ({ roles, layoutStyle = "vertical" }: OrgChartPreviewProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: "#f97316",
    secondary: "#6366f1",
    accent: "#ec4899",
  });

  // Helper function to get photo URL from asset ID
  const getPhotoUrl = (assetId?: string): string | undefined => {
    if (!assetId) return undefined;
    const assets = getAssets();
    const asset = assets.find(a => a.id === assetId);
    return asset?.dataUrl;
  };

  useEffect(() => {
    const colors = getBrandColors();
    setBrandColors(colors);

    const handleBrandColorsChanged = () => {
      const updatedColors = getBrandColors();
      setBrandColors(updatedColors);
    };

    window.addEventListener("brandColorsChanged", handleBrandColorsChanged);
    return () => window.removeEventListener("brandColorsChanged", handleBrandColorsChanged);
  }, []);

  // Build hierarchy: find root roles (no reportsTo or reportsTo doesn't exist)
  const buildHierarchy = () => {
    const roleMap = new Map(roles.map(role => [role.title.toLowerCase(), role]));
    const roots: Role[] = [];
    const children = new Map<string, Role[]>();

    roles.forEach(role => {
      const reportsToLower = role.reportsTo.toLowerCase().trim();
      if (!reportsToLower || !roleMap.has(reportsToLower)) {
        roots.push(role);
      } else {
        const parent = reportsToLower;
        if (!children.has(parent)) {
          children.set(parent, []);
        }
        children.get(parent)!.push(role);
      }
    });

    return { roots, children };
  };

  const { roots, children } = buildHierarchy();

  // Calculate department statistics
  const getDepartmentStats = () => {
    const deptStats: { [key: string]: number } = {};
    roles.forEach(role => {
      const dept = role.department || "Unassigned";
      const deptKey = dept.toLowerCase();
      if (!deptStats[deptKey]) {
        deptStats[deptKey] = 0;
      }
      deptStats[deptKey]++;
    });
    return deptStats;
  };

  const departmentStats = getDepartmentStats();

  // Recursive component to render role and its children (VERTICAL LAYOUT)
  const RoleNodeVertical = ({ role, level = 0 }: { role: Role; level?: number }) => {
    const roleChildren = children.get(role.title.toLowerCase()) || [];
    const hasChildren = roleChildren.length > 0;

    return (
      <div className="flex flex-col items-center">
        {/* Role Card */}
        <div
          className="relative bg-card border-2 rounded-lg p-5 pb-6 shadow-md min-w-[220px] max-w-[300px]"
          style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
        >
          <div className="text-center">
            {/* Employee Photo */}
            {role.photoAssetId && getPhotoUrl(role.photoAssetId) ? (
              <img
                src={getPhotoUrl(role.photoAssetId)}
                alt={role.name || role.title}
                className="w-20 h-20 rounded-full object-cover border-2 mx-auto mb-3"
                style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 border-2"
                style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
              >
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            <h3
              className="font-bold text-lg mb-1 leading-tight"
              style={{ color: level === 0 ? brandColors.primary : brandColors.secondary }}
            >
              {role.title}
            </h3>
            {role.name && (
              <p className="text-sm mb-2 leading-tight text-foreground/80 font-medium">
                {role.name}
              </p>
            )}
            <p className="text-sm mb-3 leading-tight text-foreground/70 font-medium">
              {role.department}
            </p>
            {role.responsibilities && (
              <p className="text-xs leading-relaxed text-foreground/60 line-clamp-2 pb-1">
                {role.responsibilities}
              </p>
            )}
          </div>
        </div>

        {/* Connector Line */}
        {hasChildren && (
          <div
            className="w-0.5 h-8"
            style={{ backgroundColor: brandColors.accent }}
          />
        )}

        {/* Children */}
        {hasChildren && (
          <div className="flex gap-8 relative">
            {/* Horizontal connector line */}
            {roleChildren.length > 1 && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  backgroundColor: brandColors.accent,
                  width: `calc(100% - ${200 / roleChildren.length}px)`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
            {roleChildren.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
                <div
                  className="w-0.5 h-8"
                  style={{ backgroundColor: brandColors.accent }}
                />
                <RoleNodeVertical role={child} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Recursive component to render role and its children (HORIZONTAL LAYOUT - Left to Right)
  const RoleNodeHorizontal = ({ role, level = 0 }: { role: Role; level?: number }) => {
    const roleChildren = children.get(role.title.toLowerCase()) || [];
    const hasChildren = roleChildren.length > 0;

    if (!hasChildren) {
      // Leaf node - just render the card
      return (
        <div
          className="bg-card border-2 rounded-lg p-5 pb-6 shadow-md min-w-[220px] max-w-[300px]"
          style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
        >
          <div className="text-center">
            {/* Employee Photo */}
            {role.photoAssetId && getPhotoUrl(role.photoAssetId) ? (
              <img
                src={getPhotoUrl(role.photoAssetId)}
                alt={role.name || role.title}
                className="w-20 h-20 rounded-full object-cover border-2 mx-auto mb-3"
                style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 border-2"
                style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
              >
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            <h3
              className="font-bold text-lg mb-1 leading-tight"
              style={{ color: level === 0 ? brandColors.primary : brandColors.secondary }}
            >
              {role.title}
            </h3>
            {role.name && (
              <p className="text-sm mb-2 leading-tight text-foreground/80 font-medium">
                {role.name}
              </p>
            )}
            <p className="text-sm mb-3 leading-tight text-foreground/70 font-medium">
              {role.department}
            </p>
            {role.responsibilities && (
              <p className="text-xs leading-relaxed text-foreground/60 line-clamp-2 pb-1">
                {role.responsibilities}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Node with children
    return (
      <div className="flex items-stretch gap-0">
        {/* Role Card */}
        <div className="flex items-center">
          <div
            className="bg-card border-2 rounded-lg p-5 pb-6 shadow-md min-w-[220px] max-w-[300px]"
            style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
          >
            <div className="text-center">
              {/* Employee Photo */}
              {role.photoAssetId && getPhotoUrl(role.photoAssetId) ? (
                <img
                  src={getPhotoUrl(role.photoAssetId)}
                  alt={role.name || role.title}
                  className="w-20 h-20 rounded-full object-cover border-2 mx-auto mb-3"
                  style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 border-2"
                  style={{ borderColor: level === 0 ? brandColors.primary : brandColors.secondary }}
                >
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              <h3
                className="font-bold text-lg mb-1 leading-tight"
                style={{ color: level === 0 ? brandColors.primary : brandColors.secondary }}
              >
                {role.title}
              </h3>
              {role.name && (
                <p className="text-sm mb-2 leading-tight text-foreground/80 font-medium">
                  {role.name}
                </p>
              )}
              <p className="text-sm mb-3 leading-tight text-foreground/70 font-medium">
                {role.department}
              </p>
              {role.responsibilities && (
                <p className="text-xs leading-relaxed text-foreground/60 line-clamp-2 pb-1">
                  {role.responsibilities}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal connector line */}
        <div className="flex items-center">
          <div
            className="w-16 h-0.5"
            style={{ backgroundColor: brandColors.accent }}
          />
        </div>

        {/* Children container with vertical line */}
        <div className="flex items-stretch">
          {roleChildren.length === 1 ? (
            // Single child - no vertical line needed
            <RoleNodeHorizontal role={roleChildren[0]} level={level + 1} />
          ) : (
            // Multiple children - need vertical line
            <div className="relative flex flex-col justify-around gap-4 py-4">
              {/* Vertical connector line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: brandColors.accent }}
              />

              {/* Children with small horizontal connectors */}
              {roleChildren.map((child) => (
                <div key={child.id} className="flex items-center gap-0">
                  {/* Small horizontal line from vertical line to child */}
                  <div
                    className="w-6 h-0.5"
                    style={{ backgroundColor: brandColors.accent }}
                  />
                  <RoleNodeHorizontal role={child} level={level + 1} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No roles to display. Add roles in Edit mode.</p>
      </div>
    );
  }

  const RoleNode = layoutStyle === "vertical" ? RoleNodeVertical : RoleNodeHorizontal;

  // Get unique departments with their counts
  const departmentList = Object.entries(departmentStats).map(([deptKey, count]) => {
    const role = roles.find(r => (r.department || "Unassigned").toLowerCase() === deptKey);
    return {
      name: role?.department || "Unassigned",
      count,
    };
  });

  return (
    <div className="space-y-6">
      {/* Department Statistics */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Department Overview</h3>
        <div className="flex flex-wrap gap-3">
          {departmentList.map((dept) => (
            <div
              key={dept.name}
              className="bg-card border rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: brandColors.primary }}
              />
              <span className="text-sm font-medium">{dept.name}</span>
              <span className="text-xs text-muted-foreground">({dept.count})</span>
            </div>
          ))}
          <div className="bg-card border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm font-medium">Total Employees:</span>
            <span className="text-sm font-bold" style={{ color: brandColors.primary }}>
              {roles.length}
            </span>
          </div>
        </div>
      </div>

      {/* Org Chart */}
      <div
        className="bg-background rounded-lg p-8 overflow-auto"
        data-org-chart-preview
      >
        <div className={layoutStyle === "vertical" ? "flex flex-col gap-16 items-center min-w-max" : "flex flex-col gap-8 items-start min-w-max"}>
          {roots.map((root) => (
            <RoleNode key={root.id} role={root} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrgChartPreview;

