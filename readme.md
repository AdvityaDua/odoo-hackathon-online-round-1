# 🚀 GearGuard – Smart Maintenance & Asset Management Platform

> A unified web and mobile platform that automates industrial maintenance scheduling, technician assignment, and real-time repair tracking for equipment and work centers.

---

## 🧠 Problem Statement

Industrial facilities rely on multiple machines, work centers, and technicians to keep operations running smoothly.  
However, maintenance today is often:

- Manual and unstructured  
- Dependent on spreadsheets or fragmented tools  
- Lacking real-time visibility into technician workload and repair progress  

This leads to:
- Delayed repairs  
- Poor technician utilization  
- No audit trail of maintenance activities  
- Downtime impacting productivity and costs  

---

## 💡 Proposed Solution

**GearGuard** is a centralized **maintenance management system** that streamlines how maintenance requests are created, scheduled, assigned, executed, and tracked — across both **web and mobile platforms**.

### What we built:
- A **Flutter mobile app** for users and technicians  
- A **React (Vite) admin portal** for full system control  

### How it solves the problem:
- Automates technician assignment based on availability and teams  
- Treats work centers as real operational locations  
- Enables live work updates and reassignment without data loss  
- Maintains a complete audit trail of all maintenance activities  

### 🔑 Key Highlights
- 🔹 Automated scheduling & technician assignment  
- 🔹 Technician work logs with real-time status updates  
- 🔹 Reassignment with full assignment history  
- 🔹 Role-based access for users, technicians, and admins  

---

## 🛠️ Tech Stack

### Frontend
- **Flutter** – Mobile app (Users & Technicians)
- **React + Vite** – Admin & Management Portal

### Backend
- **Django**
- **Django REST Framework**
- **JWT Authentication**

### Database
- **PostgreSQL**

### Cloud / Tools
- GitHub (Version Control)
- REST APIs
- Modular, scalable backend architecture

---

## 🔄 System Architecture

1. User or technician interacts via mobile app  
2. Admin manages assets and teams via web portal  
3. Backend validates roles, availability, and business rules  
4. Maintenance logic assigns technicians and tracks progress  
5. Updates are stored with full audit history  
6. Results are returned instantly to web & app clients  

*(Architecture diagram can be added in later rounds)*

---

## 🎯 Key Features

- ✅ **Maintenance Request Management**  
  Users can create preventive or corrective maintenance requests for equipment.

- ✅ **Automated Scheduling & Assignment**  
  System assigns technicians based on availability, team, and time slot.

- ✅ **Work Center–Based Maintenance**  
  Maintenance is linked to real operational locations (work centers).

- ✅ **Technician Work Logs**  
  Technicians log progress, blockages, and completion directly from the app.

- ✅ **Reassignment with Audit Trail**  
  Maintenance can be reassigned across teams while preserving full history.

- ✅ **Role-Based Access Control**  
  Separate flows for users, technicians, and admins.

---

## 📈 Use Cases

### **Use Case 1: Factory User**
A production user reports a machine issue, selects a time slot, and the system automatically assigns an available technician.

### **Use Case 2: Technician**
A technician receives assigned work on the mobile app, logs progress, escalates priority automatically, or requests reassignment if needed.

### **Use Case 3: Admin**
An admin monitors all maintenance, manages teams, equipment, work centers, and ensures smooth operations through the web portal.

---

## 🌍 Impact & Scalability

- 🚀 Reduces equipment downtime  
- 📉 Improves technician utilization  
- 🧾 Creates a complete maintenance audit trail  
- 🏭 Scales across multiple plants, companies, and industries  

**Long-term vision:**  
Evolve GearGuard into a full CMMS platform with predictive maintenance, analytics, and AI-driven failure detection.

---

## 🔍 Why This Stands Out

- 🔥 Real-world maintenance logic, not a CRUD demo  
- 🔄 Intelligent reassignment without losing history  
- 📱 Seamless mobile + web experience  
- 🧠 Strong backend architecture with clear domain modeling  
- ⚡ Built with scalability and production-readiness in mind  

---

## 🧪 Feasibility & MVP Plan

### What we built during the hackathon:
- Maintenance request lifecycle
- Scheduling & technician assignment
- Technician work logs
- Reassignment with history
- Mobile app + admin web portal

### Future Enhancements:
- Predictive maintenance using ML
- SLA & downtime analytics
- Notifications & alerts
- Multi-location enterprise dashboards

---

## 🧑‍🤝‍🧑 Team Details

| Name | Role |
|-----|------|
| Advitya Dua | Backend / Architecture |
| Karman Singh | Frontend (Flutter) |
| Anmol | Frontend (React) |
| Kashish | DB and UX design |

---

## 🔗 Demo & Links

- 📹 Demo Video: _To be added_
- 💻 GitHub Repo: _To be added_
- 📄 PPT / Docs: _To be added_

---

## 🏁 Conclusion

GearGuard transforms how industrial maintenance is planned and executed by combining automation, real-time tracking, and role-based workflows across web and mobile platforms.  
It reduces downtime, improves accountability, and brings structure to maintenance operations — making it scalable, auditable, and future-ready.