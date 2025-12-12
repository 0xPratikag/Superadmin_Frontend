import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardBase from "./DashboardBase";
import Sidebar from "./Sidebar";
import AdminList from "./Admin/AdminList";
import CreateAdmin from "./Admin/CreateAdmin";
import AdminPermision from "./Admin/AdminPermision";
import SubRoleManager from "./Admin/SubRoleManager";
import SettingPage from "./SettingPage";
import EditAdmin from "./Admin/EditAdmin";
import TherapistCreate from "./Therapist/TherapistCreate";
import TherapistList from "./Therapist/TherapistList";
import AdminDetails from "./Admin/AdminDetails";
import AssistantCreate from "./Assistant/AssistantCreate";
import AssistantList from "./Assistant/AssistantList";

// import EmployeeList from "./Monitoring/EmployeeList";
import PermissionManager from "./PermissionManager";
import RoleManager from "./RoleManager";
import BranchList from "./Branch/BranchList";
import BranchCreate from "./Branch/BranchCreate";
import BranchEdit from "./Branch/BranchEdit";
import EmployeeList from "./Employee/EmployeeList";
import EmployeeCreate from "./Employee/EmployeeCreate";
import EmployeeEdit from "./Employee/EmployeeEdit";
import DesignationManagement from "./Designation/DesignationManagement";
import AttendanceBranches from "./Monitoring/AttendanceBranches";
import BranchAttendance from "./Monitoring/BranchAttendance";
import DeviceList from "./Monitoring/DeviceList";


const DashboardRouting = () => {
  return (
    <div className="flex w-full">
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashboardBase />} />
        <Route path="/dashboard" element={<DashboardBase />} />



        <Route path="/admin/create" element={<CreateAdmin />} />
        <Route path="/admin/list" element={<AdminList />} />
<Route path="/admin/details/:id" element={<AdminDetails />} />
        <Route path="/admin/adminpermision" element={<AdminPermision />} />

        <Route path="/admin/roles-permissions" element={<SubRoleManager />} />
        <Route path="/manageRole" element={<RoleManager />} />

        <Route path="/settingPage" element={<SettingPage />} />

        <Route path="/admin/edit/:id" element={<EditAdmin />} />


        {/* *************************************** Therepist ****************************************************************** */}


        <Route path="/therapist/create" element={< TherapistCreate/>} />
        <Route path="/therapist/edit/:id" element={<TherapistCreate />} />

        <Route path="/therapist/list" element={< TherapistList/>} />




        <Route path="/assistant/create" element={< AssistantCreate/>} />
        <Route path="/assistant/edit/:id" element={<AssistantCreate />} />

        <Route path="/assistant/list" element={< AssistantList/>} />








{/* ******************************** new routings ************************************ */}

<Route path="/monitor/attendance" element={<AttendanceBranches />} />
<Route path="/monitor/attendance/:branchId" element={<BranchAttendance />} />
<Route path="/monitor/devices" element={<DeviceList />} />

    

        <Route path="/permissions" element={<PermissionManager />} />
<Route path="/roles" element={<RoleManager />} />

<Route path="/roles/designation/manage" element={<DesignationManagement />} />


<Route path="/branch/list" element={<BranchList />} />
<Route path="/branch/create" element={<BranchCreate />} />
<Route path="/branch/edit/:id" element={<BranchEdit />} />



<Route path="/employee/list" element={<EmployeeList />} />
<Route path="/employee/create" element={<EmployeeCreate />} />
<Route path="/employee/edit/:id" element={<EmployeeEdit />} />



      </Routes>
    </div>
  );
};

export default DashboardRouting;
