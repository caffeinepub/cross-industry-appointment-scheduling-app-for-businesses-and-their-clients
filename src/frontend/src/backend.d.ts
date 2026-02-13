import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ServiceId = string;
export type StaffId = string;
export interface Availability {
    startTime: bigint;
    endTime: bigint;
    dayOfWeek: bigint;
}
export interface PublicBookingRequest {
    startTime: bigint;
    name: string;
    email?: string;
    serviceId: ServiceId;
    phone?: string;
}
export interface Service {
    id: ServiceId;
    name: string;
    durationMinutes: bigint;
    price?: Price;
}
export type AppointmentId = string;
export interface Price {
    currency: string;
    amount: bigint;
}
export interface Staff {
    id: StaffId;
    name: string;
}
export interface Client {
    id: ClientId;
    name: string;
    email?: string;
    phone?: string;
}
export interface BusinessProfile {
    name: string;
    timeZone: string;
}
export type ClientId = string;
export interface UserProfile {
    name: string;
}
export interface Appointment {
    id: AppointmentId;
    startTime: bigint;
    status: AppointmentStatus;
    clientId: ClientId;
    staffId?: StaffId;
    endTime: bigint;
    serviceId: ServiceId;
}
export enum AppointmentStatus {
    scheduled = "scheduled",
    noShow = "noShow",
    canceled = "canceled",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClient(businessId: string, client: Client): Promise<void>;
    addService(businessId: string, service: Service): Promise<void>;
    addStaff(businessId: string, staff: Staff): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookPublic(businessId: string, request: PublicBookingRequest): Promise<AppointmentId>;
    createAppointment(businessId: string, appointment: Appointment): Promise<void>;
    createBusiness(businessId: string, name: string, timeZone: string): Promise<void>;
    getAllAppointments(businessId: string): Promise<Array<Appointment>>;
    getAllClients(businessId: string): Promise<Array<Client>>;
    getAllServices(businessId: string): Promise<Array<Service>>;
    getAllStaff(businessId: string): Promise<Array<Staff>>;
    getAppointment(businessId: string, appointmentId: AppointmentId): Promise<Appointment | null>;
    getAvailability(businessId: string, staffId: StaffId): Promise<Availability | null>;
    getAvailableSlots(businessId: string, serviceId: ServiceId, date: bigint): Promise<Array<bigint>>;
    getBusiness(businessId: string): Promise<BusinessProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(businessId: string, clientId: ClientId): Promise<Client | null>;
    getService(businessId: string, serviceId: ServiceId): Promise<Service | null>;
    getStaff(businessId: string, staffId: StaffId): Promise<Staff | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAvailability(businessId: string, staffId: StaffId, availability: Availability): Promise<void>;
}
