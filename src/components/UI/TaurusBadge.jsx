import { motion } from 'framer-motion'

export default function TaurusBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      style={{

      }}
    >
    </motion.div>
  )
}
