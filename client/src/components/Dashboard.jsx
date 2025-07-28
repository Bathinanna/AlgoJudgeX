import { motion } from "framer-motion";
import GoogleSheetSummary from "./GoogleSheetSummary";
import MainHero from "./MainHero";

const Dashboard = () => {
  return (
    <motion.div
      className="container py-6 space-y-8 px-4"
      style={{ backgroundColor: "#161A30", color: "#E0E0E0" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <MainHero />
      <GoogleSheetSummary />
    </motion.div>
  );
};

export default Dashboard;
