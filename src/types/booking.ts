
export interface CustomerMaster {
    ID: number;
    CustomerName: string;
    FacebookIink: string;
    ActiveStatus?: boolean | null;
}

export interface LocationMaster {
    ID: number;
    LocationName: string;
    Locationlink: string;
    ActiveStatus?: boolean | null;
}

export interface JobTypeMaster {
    ID: number;
    TypeName: string;
    MinTimeMinutes: number;
    PriceUnitMinutes: number;
    ActiveStatus?: boolean | null;
}

export interface Booking {
    ID: number;
    created_at: string;
    StartTime: string | null;
    EndTime: string | null;
    Date: string | null;
    Price: number | null;
    Tax: number | null;
    Summary: number | null;
    Status: string | null;
    Notes: string | null;
    CustomerID: number | null;
    LocationID: number | null;
    JobType: number | null;
    CreatedID: string | null;
    // Relationships for Joined Queries
    CustomerMaster?: CustomerMaster;
    LocationMaster?: LocationMaster;
    JobTypeMaster?: JobTypeMaster;
}

export interface SelectOption {
    id: string | number;
    label: string;
}

export type BookingStatus = 'Booking' | 'Inprogress' | 'Completed' | 'Canceled';
