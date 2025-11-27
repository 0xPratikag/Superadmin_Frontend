import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardBase from "./DashboardBase";
import Sidebar from "./Sidebar";
import AdminList from "./Admin/AdminList";
import CreateAdmin from "./Admin/CreateAdmin";
import AdminPermision from "./Admin/AdminPermision";
import SubRoleManager from "./Admin/SubRoleManager";
import RoleManager from "./Admin/RoleManager";
import SettingPage from "./SettingPage";
import EditAdmin from "./Admin/EditAdmin";
import TherapistCreate from "./Therapist/TherapistCreate";
import TherapistList from "./Therapist/TherapistList";
import AdminDetails from "./Admin/AdminDetails";
import AssistantCreate from "./Assistant/AssistantCreate";
import AssistantList from "./Assistant/AssistantList";

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







      </Routes>
    </div>
  );
};

export default DashboardRouting;
