import { motion } from "framer-motion";
import { Property } from "@/types";
import PropertyCard from "@/components/property/PropertyCard";

interface AnimatedPropertyCardProps {
  property: Property;
  groupSize: number;
  showPerPerson?: boolean;
  index?: number;
}

export default function AnimatedPropertyCard({
  property,
  groupSize,
  showPerPerson,
  index = 0,
}: AnimatedPropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      viewport={{ once: false, margin: "-50px" }}
      className="group"
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        whileHover={{ boxShadow: "0 20px 60px rgba(59, 130, 246, 0.22)" }}
      >
        <PropertyCard property={property} groupSize={groupSize} showPerPerson={showPerPerson} />
      </motion.div>
    </motion.div>
  );
}
