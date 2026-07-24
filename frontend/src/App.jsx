import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MaintenanceGate, {
  MAINTENANCE_MODE,
} from "./components/MaintenanceGate.jsx";

import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import OrganizerLayout from "./layouts/OrganizerLayout.jsx";

import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import CategoryPage from "./pages/CategoryPage.jsx";
import EventsPage from "./pages/voter/EventsPage.jsx";
import EventDetailPage from "./pages/voter/EventDetailPage.jsx";
import CandidatePage from "./pages/voter/CandidatePage.jsx";
import VoteSuccessPage from "./pages/voter/VoteSuccessPage.jsx";
import PollsIndexPage from "./pages/voter/PollsIndexPage.jsx"; // NEW
import EventResultsPage from "./pages/voter/EventResultsPage.jsx"; // NEW

import AdminOverviewPage from "./pages/admin/AdminOverviewPage.jsx";
import AdminEventsPage from "./pages/admin/AdminEventsPage.jsx";
import AdminEventDetailPage from "./pages/admin/AdminEventDetailPage.jsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.jsx";
import AdminStaffPage from "./pages/admin/AdminStaffPage.jsx";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage.jsx";

import OrganizerOverviewPage from "./pages/organizer/OrganizerOverviewPage.jsx";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage.jsx";
import OrganizerEventDetailPage from "./pages/organizer/OrganizerEventDetailPage.jsx";
import OrganizerCategoriesPage from "./pages/organizer/OrganizerCategoryPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  // if (MAINTENANCE_MODE) {
  //   return <MaintenanceGate />;
  // }
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetailPage />} />
          <Route
            path="events/:eventId/candidates/:candidateId"
            element={<CandidatePage />}
          />
          <Route
            path="events/:eventId/results"
            element={<EventResultsPage />}
          />{" "}
          {/* NEW */}
          <Route path="polls" element={<PollsIndexPage />} /> {/* NEW */}
          <Route path="vote/success" element={<VoteSuccessPage />} />
          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route
                path="events/:eventId"
                element={<AdminEventDetailPage />}
              />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
            </Route>
          </Route>
          {/* Staff (formerly "organizer") — role string updated to match
              the new User model. Both admin and staff land here. */}
          <Route element={<ProtectedRoute allowedRoles={["staff", "admin"]} />}>
            <Route path="organizer" element={<OrganizerLayout />}>
              <Route index element={<OrganizerOverviewPage />} />
              <Route path="events" element={<OrganizerEventsPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route
                path="events/:eventId"
                element={<OrganizerEventDetailPage />}
              />
              <Route path="categories" element={<OrganizerCategoriesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
