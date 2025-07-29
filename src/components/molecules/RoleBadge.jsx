import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const RoleBadge = ({ role, className }) => {
  const roleConfig = {
    "Free_User": {
      label: "무료",
      variant: "secondary",
      icon: "User"
    },
    "Premium": {
      label: "프리미엄",
      variant: "default", 
      icon: "Star"
    },
    "Master": {
      label: "마스터",
      variant: "accent",
      icon: "Crown"
    }
  };

  const config = roleConfig[role] || roleConfig["Free_User"];

  return (
    <Badge variant={config.variant} className={className}>
      <ApperIcon name={config.icon} className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default RoleBadge;