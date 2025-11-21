import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserAdd from './pages/UserAdd'
import ProjectAdd from './pages/ProjectAdd'
import Projects from './pages/Projects'
import TaskAdd from './pages/TaskAdd'
import Logs from './pages/Logs'
import NotFound from './pages/NotFound'
import Tasks from './pages/Tasks'
import ProjectDetails from './pages/ProjectDetails'
import TaskAddAttachment from './pages/TaskAddAttachment'
import UserEdit from './pages/UserEdit'
import EditProject from './pages/EditProject'
import EditTask from './pages/EditTask'

function App() {
  document.title = "Proje Sistemi";
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />


        //PROJECT pages
        <Route path="/addproject" element={<ProjectAdd />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projectdetails" element={<ProjectDetails />} />
        <Route path="/editproject" element={<EditProject />} />

        //TASK pages
        <Route path="/addtask" element={<TaskAdd />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/addattachment" element={<TaskAddAttachment />} />
        <Route path="/edittask" element={<EditTask />} />

        //ADMIN PAGES
        <Route path="/users" element={<Users />} />
        <Route path="/adduser" element={<UserAdd />} />
        <Route path="/edituser" element={<UserEdit />} />

        
        //OTHER pages
        <Route path="/logs" element={<Logs />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
