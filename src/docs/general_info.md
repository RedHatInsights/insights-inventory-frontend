# Inventory detail - System Overview and Details tabs

The system details view is split into two tabs: **Overview** and **Details**. Each tab renders a set of General Info cards in a two-column grid.

## Overview tab

Cards shown:

- **System status** (`system-status-card`) – RHC status, last seen, stale timestamp
- **System properties** (`system-card`) – Host name, Workloads, Display name, Workspace, Ansible hostname (editable when permitted)
- **Data collectors** (`dataCollector-card`) – Reporters that collect data from hosts (e.g. puptoo, RHSM, Yupana)
- **Subscriptions** (`subscriptions-card`) – Subscription and entitlement information

Layout: System status and System properties in the left column; Data collectors and Subscriptions in the right column.

## Details tab

Cards shown, in layout order:

**Left column:**

- **Hardware properties** (`hardware-properties-card`) – Number of CPUs, RAM, Sockets, Type, Cores per socket, Vendor, CPU flags
- **Operating system** (`os-card`) – Architecture, Release, Kernel modules, Last boot time, Kernel release, Update method
- **Network interfaces** (`network-interfaces-card`) – IPv4 addresses, Interfaces/NICs, IPv6 addresses, FQDN
- **BOOTC** (`bootc-card`) – Shown only for image-based (Bootc) hosts

**Right column:**

- **RHEL AI** (`rhel-ai-card`) – Shown only when the system has RHEL AI workload data
- **Configuration** (`configuration-card`) – Installed packages, enabled services, running processes, repositories
- **BIOS** (`bios-card`) – BIOS vendor, version, release date
- **Collection information** (`collection-card`) – Shown when `CollectionCardWrapper` is provided
- **Runtimes/Processes** – Async component when `showRuntimesProcesses` is true and `entity.fqdn` is set

All cards except BOOTC, RHEL AI, Collection, and Runtimes are visible by default. Cards can be replaced or disabled via wrapper props (e.g. `HardwarePropertiesCardWrapper={false}` or a custom component).

---

## Card reference

### SystemCard (Overview)

Title: **System properties**. Displays host identity and workload info: Host name, Workloads, Display name, Workspace, Ansible hostname. Display name and Ansible hostname are inline-editable when the user has write permissions. Accepts an `extra` array of additional row items.

### HardwarePropertiesCard (Details)

Title: **Hardware properties**. Displays CPU and hardware info from system profile and infrastructure selectors: Number of CPUs, RAM, Sockets, Type, Cores per socket, Vendor, CPU flags. Type is derived from infrastructure type or RHSM `IS_VIRTUAL`; Vendor from infrastructure. CPU flags open a modal when clicked. Connected to Redux for `systemProfile` and `entity`.

### NetworkInterfacesCard (Details)

Title: **Network interfaces**. Displays network data from the infrastructure selector: IPv4 addresses, Interfaces/NICs, IPv6 addresses, FQDN. IPv4, IPv6, and Interfaces are clickable and open modals. Replaces the previous “Infrastructure” card for network-related fields (Type and Vendor moved to Hardware properties).

### OperatingSystemCard (Details)

Title: **Operating system**. Displays OS info: Architecture, Release, Kernel modules, Last boot time, Kernel release, Update method (when present). Kernel modules open a modal when clicked.

### DataCollectorsCard (Overview)

Title: **Data collectors**. “Data collector” is the tool or product that collects data from hosts and sends it to Red Hat. The card shows a table of default collectors (e.g. puptoo, RHSM, Yupana). Custom collectors can be passed via a `collectors` array, and a custom `dataMapper` can replace the default table behavior.

#### Usage

```jsx
<Overview
  {...someProps}
  DataCollectorsCardWrapper={(props) => (
    <Suspense fallback="">
      <DataCollectorsCard
        {...props}
        collectors={[
          {
            name: 'Custom reporter name',
            status: customReporterStatus,
            updated: customReporterLastCheckIn,
            details: {
              name: 'Custom reporter id name',
              id: customReporterId,
            },
          },
        ]}
      />
    </Suspense>
  )}
/>
```

### Other cards

- **SystemStatusCard** – System status (Overview).
- **SubscriptionCard** – Subscriptions (Overview).
- **BiosCard** – BIOS (Details).
- **ConfigurationCard** – Configuration (Details).
- **BootcImageCard** – BOOTC image (Details, image-based hosts only).
- **RhelAICard** – RHEL AI (Details, when workload data is present).
- **CollectionCard** – Collection information (Details, when wrapper provided).

---

## Customizing cards

Overview and Details accept wrapper props so you can replace or hide a card:

- **Overview:** `SystemCardWrapper`, `SystemStatusCardWrapper`, `DataCollectorsCardWrapper`, `SubscriptionCardWrapper`
- **Details:** `HardwarePropertiesCardWrapper`, `NetworkInterfacesCardWrapper`, `OperatingSystemCardWrapper`, `BiosCardWrapper`, `BootcImageCardWrapper`, `ConfigurationCardWrapper`, `RhelAICardWrapper`, `CollectionCardWrapper`

Pass a component to replace the default card, or `false` to hide it. Example:

```jsx
<Details
  entity={entity}
  inventoryId={inventoryId}
  fetchEntity={fetchEntity}
  HardwarePropertiesCardWrapper={false}
  ConfigurationCardWrapper={MyConfigurationCard}
/>
```
