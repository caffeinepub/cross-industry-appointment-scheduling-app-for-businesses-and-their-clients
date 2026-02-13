import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat64 "mo:core/Nat64";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type ServiceId = Text;
  public type StaffId = Text;
  public type ClientId = Text;
  public type AppointmentId = Text;
  public type Price = {
    amount : Nat;
    currency : Text; // e.g., "USD", "BTC"
  };

  public type AppointmentStatus = {
    #scheduled;
    #canceled;
    #completed;
    #noShow;
  };

  public type BusinessProfile = {
    name : Text;
    timeZone : Text; // Use TZ database name (e.g., "Europe/London")
  };

  public type Service = {
    id : ServiceId;
    name : Text;
    durationMinutes : Nat;
    price : ?Price;
  };

  public type Staff = {
    id : StaffId;
    name : Text;
  };

  public type Client = {
    id : ClientId;
    name : Text;
    phone : ?Text;
    email : ?Text;
  };

  public type Appointment = {
    id : AppointmentId;
    serviceId : ServiceId;
    staffId : ?StaffId;
    clientId : ClientId;
    startTime : Int; // UTC timestamp
    endTime : Int; // UTC timestamp
    status : AppointmentStatus;
  };

  public type Availability = {
    dayOfWeek : Nat; // 0 = Sunday, 6 = Saturday
    startTime : Nat; // Minutes since midnight
    endTime : Nat; // Minutes since midnight
  };

  public type PublicBookingRequest = {
    serviceId : ServiceId;
    startTime : Int;
    name : Text;
    phone : ?Text;
    email : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  module Appointment {
    public func compare(a : Appointment, b : Appointment) : Order.Order {
      compareByTime(a, b);
    };
    public func compareByTime(a : Appointment, b : Appointment) : Order.Order {
      Int.compare(a.startTime, b.startTime);
    };
  };

  // Persistent state using Maps
  let businesses = Map.empty<Text, BusinessProfile>();
  let businessOwners = Map.empty<Text, Principal>(); // Maps businessId to owner Principal
  let services = Map.empty<Text, Map.Map<ServiceId, Service>>();
  let staffMembers = Map.empty<Text, Map.Map<StaffId, Staff>>();
  let clients = Map.empty<Text, Map.Map<ClientId, Client>>();
  let appointments = Map.empty<Text, Map.Map<AppointmentId, Appointment>>();
  let availabilities = Map.empty<Text, Map.Map<Text, Availability>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper methods
  func getOrCreateMap<K, V>(store : Map.Map<Text, Map.Map<K, V>>, key : Text) : Map.Map<K, V> {
    switch (store.get(key)) {
      case (?existing) { existing };
      case (null) {
        let newMap = Map.empty<K, V>();
        store.add(key, newMap);
        newMap;
      };
    };
  };

  // Authorization helper: Check if caller owns the business
  func isBusinessOwner(caller : Principal, businessId : Text) : Bool {
    switch (businessOwners.get(businessId)) {
      case (?owner) { Principal.equal(caller, owner) };
      case (null) { false };
    };
  };

  // Authorization helper: Check if caller can access business (owner or admin)
  func canAccessBusiness(caller : Principal, businessId : Text) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isBusinessOwner(caller, businessId);
  };

  // Business Profile Management
  public shared ({ caller }) func createBusiness(businessId : Text, name : Text, timeZone : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create businesses");
    };
    if (businesses.containsKey(businessId)) {
      Runtime.trap("Business with this ID already exists");
    };
    let profile : BusinessProfile = { name; timeZone };
    businesses.add(businessId, profile);
    businessOwners.add(businessId, caller); // Set caller as owner
  };

  public query ({ caller }) func getBusiness(businessId : Text) : async ?BusinessProfile {
    // Public read access - anyone can view business profile
    businesses.get(businessId);
  };

  // Service Management
  public shared ({ caller }) func addService(businessId : Text, service : Service) : async () {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can add services");
    };

    // Validate price amount if present
    switch (service.price) {
      case (?price) {
        if (price.amount == 0) {
          Runtime.trap("Price amount must be greater than 0 or set to null");
        };
      };
      case (null) {};
    };

    let serviceMap = getOrCreateMap(services, businessId);
    if (serviceMap.containsKey(service.id)) {
      Runtime.trap("Service with this ID already exists");
    };
    serviceMap.add(service.id, service);
  };

  public query ({ caller }) func getService(businessId : Text, serviceId : ServiceId) : async ?Service {
    // Public read access - needed for public booking flow
    switch (services.get(businessId)) {
      case (?serviceMap) { serviceMap.get(serviceId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllServices(businessId : Text) : async [Service] {
    // Public read access - needed for public booking flow
    switch (services.get(businessId)) {
      case (?serviceMap) { serviceMap.values().toArray() };
      case (null) { [] };
    };
  };

  // Staff Management
  public shared ({ caller }) func addStaff(businessId : Text, staff : Staff) : async () {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can add staff");
    };
    let staffMap = getOrCreateMap(staffMembers, businessId);
    if (staffMap.containsKey(staff.id)) {
      Runtime.trap("Staff member with this ID already exists");
    };
    staffMap.add(staff.id, staff);
  };

  public query ({ caller }) func getStaff(businessId : Text, staffId : StaffId) : async ?Staff {
    // Public read access - needed for public booking flow
    switch (staffMembers.get(businessId)) {
      case (?staffMap) { staffMap.get(staffId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllStaff(businessId : Text) : async [Staff] {
    // Public read access - needed for public booking flow
    switch (staffMembers.get(businessId)) {
      case (?staffMap) { staffMap.values().toArray() };
      case (null) { [] };
    };
  };

  // Client Management
  public shared ({ caller }) func addClient(businessId : Text, client : Client) : async () {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can add clients");
    };
    let clientMap = getOrCreateMap(clients, businessId);
    if (clientMap.containsKey(client.id)) {
      Runtime.trap("Client with this ID already exists");
    };
    clientMap.add(client.id, client);
  };

  public query ({ caller }) func getClient(businessId : Text, clientId : ClientId) : async ?Client {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can view clients");
    };
    switch (clients.get(businessId)) {
      case (?clientMap) { clientMap.get(clientId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllClients(businessId : Text) : async [Client] {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can view clients");
    };
    switch (clients.get(businessId)) {
      case (?clientMap) { clientMap.values().toArray() };
      case (null) { [] };
    };
  };

  // Appointment Management
  public shared ({ caller }) func createAppointment(businessId : Text, appointment : Appointment) : async () {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can create appointments");
    };

    // Validate service exists
    switch (services.get(businessId)) {
      case (?serviceMap) {
        if (not serviceMap.containsKey(appointment.serviceId)) {
          Runtime.trap("Service does not exist");
        };
      };
      case (null) {
        Runtime.trap("Business has no services");
      };
    };

    // Validate staff exists if specified
    switch (appointment.staffId) {
      case (?staffId) {
        switch (staffMembers.get(businessId)) {
          case (?staffMap) {
            if (not staffMap.containsKey(staffId)) {
              Runtime.trap("Staff member does not exist");
            };
          };
          case (null) {
            Runtime.trap("Business has no staff members");
          };
        };
      };
      case (null) {};
    };

    // Check for double bookings
    let appointmentMap = getOrCreateMap(appointments, businessId);
    let isConflict = appointmentMap.values().any(
      func(existing : Appointment) : Bool {
        existing.status == #scheduled and
        existing.staffId == appointment.staffId and
        not (existing.endTime <= appointment.startTime or existing.startTime >= appointment.endTime)
      }
    );
    if (isConflict) {
      Runtime.trap("This time slot is already taken for the selected staff member");
    };

    appointmentMap.add(appointment.id, appointment);
  };

  public query ({ caller }) func getAppointment(businessId : Text, appointmentId : AppointmentId) : async ?Appointment {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can view appointments");
    };
    switch (appointments.get(businessId)) {
      case (?appointmentMap) { appointmentMap.get(appointmentId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllAppointments(businessId : Text) : async [Appointment] {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can view appointments");
    };
    switch (appointments.get(businessId)) {
      case (?appointmentMap) {
        appointmentMap.values().toArray().sort();
      };
      case (null) { [] };
    };
  };

  // Availability Management
  public shared ({ caller }) func setAvailability(businessId : Text, staffId : StaffId, availability : Availability) : async () {
    if (not canAccessBusiness(caller, businessId)) {
      Runtime.trap("Unauthorized: Only business owner or admin can set availability");
    };
    let availabilityMap = getOrCreateMap(availabilities, businessId);
    availabilityMap.add(staffId, availability);
  };

  public query ({ caller }) func getAvailability(businessId : Text, staffId : StaffId) : async ?Availability {
    // Public read access - needed for public booking flow
    switch (availabilities.get(businessId)) {
      case (?availabilityMap) { availabilityMap.get(staffId) };
      case (null) { null };
    };
  };

  // Public booking flow - allows guests (anonymous principals) to book
  public shared ({ caller }) func bookPublic(businessId : Text, request : PublicBookingRequest) : async AppointmentId {
    // No authentication required - this is the public booking endpoint
    // Guests (anonymous principals) are allowed
    
    // Validate business exists
    if (not businesses.containsKey(businessId)) {
      Runtime.trap("Business does not exist");
    };

    // Validate service exists
    let serviceMap = switch (services.get(businessId)) {
      case (?map) { map };
      case (null) { Runtime.trap("Business has no services") };
    };
    
    let service = switch (serviceMap.get(request.serviceId)) {
      case (?svc) { svc };
      case (null) { Runtime.trap("Service does not exist") };
    };

    let appointmentId = businessId # "-" # Time.now().toText();
    let clientId = "public-" # Time.now().toText();

    let client : Client = {
      id = clientId;
      name = request.name;
      phone = request.phone;
      email = request.email;
    };

    // Add client
    let clientMap = getOrCreateMap(clients, businessId);
    clientMap.add(clientId, client);

    let endTime = request.startTime + (service.durationMinutes * 60_000_000_000); // Convert minutes to nanoseconds

    let appointment : Appointment = {
      id = appointmentId;
      serviceId = request.serviceId;
      staffId = null; // No preferred staff for public bookings
      clientId;
      startTime = request.startTime;
      endTime;
      status = #scheduled;
    };

    // Check for double bookings (any staff member)
    let appointmentMap = getOrCreateMap(appointments, businessId);
    let isConflict = appointmentMap.values().any(
      func(existing : Appointment) : Bool {
        existing.status == #scheduled and
        not (existing.endTime <= appointment.startTime or existing.startTime >= appointment.endTime)
      }
    );
    if (isConflict) {
      Runtime.trap("This time slot is already taken");
    };

    appointmentMap.add(appointmentId, appointment);
    appointmentId;
  };

  // Query available time slots for public booking
  public query ({ caller }) func getAvailableSlots(businessId : Text, serviceId : ServiceId, date : Int) : async [Int] {
    // Public read access - needed for public booking flow
    // This is a simplified implementation - in production, this would calculate
    // available slots based on working hours and existing appointments
    [];
  };
};
