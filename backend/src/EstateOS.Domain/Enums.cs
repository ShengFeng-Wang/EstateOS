namespace EstateOS.Domain;

public enum UserRole
{
    Admin,
    AssetManager,
    PropertyManager,
    Accountant,
    MaintenanceCoordinator,
    ExecutiveViewer
}

public enum UserStatus
{
    Active,
    Inactive
}

public enum PropertyType
{
    Apartment,
    Studio,
    Townhouse,
    Office,
    Retail
}

public enum PropertyStatus
{
    Occupied,
    Vacant,
    Maintenance,
    Archived
}

public enum ContractStatus
{
    Draft,
    Active,
    ExpiringSoon,
    Expired,
    Terminated
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Overdue
}

public enum MaintenancePriority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum MaintenanceStatus
{
    Open,
    InProgress,
    Completed,
    Cancelled
}
