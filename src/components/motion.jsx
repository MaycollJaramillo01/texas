import { motion, useReducedMotion } from "framer-motion";

export const ease = [0.7, 0, 0.2, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease } },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.08) => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

export const wordRise = {
  hidden: { y: "110%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.85, ease } },
};

export function SplitHeading({ text, em, className = "", id, as = "h1" }) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  const emWords = em ? em.split(" ") : [];

  if (reduceMotion) {
    const Static = as;
    return (
      <Static id={id} className={className}>
        {text} {em && <em>{em}</em>}
      </Static>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
      variants={stagger(0.15, 0.06)}
      aria-label={`${text} ${em ?? ""}`.trim()}
    >
      {words.map((word, i) => (
        <span key={`w-${i}`} className="word" style={{ overflow: "hidden", display: "inline-block" }}>
          <motion.span style={{ display: "inline-block" }} variants={wordRise}>
            {word}
          </motion.span>
        </span>
      ))}
      {emWords.length > 0 && (
        <>
          {" "}
          <em>
            {emWords.map((word, i) => (
              <span key={`e-${i}`} className="word" style={{ overflow: "hidden", display: "inline-block" }}>
                <motion.span style={{ display: "inline-block" }} variants={wordRise}>
                  {word}
                </motion.span>
              </span>
            ))}
          </em>
        </>
      )}
    </Tag>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  variants = fadeUp,
  amount = 0.15,
  as = "div",
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function MotionSection({ children, className = "", id, amount = 0.08 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={stagger(0, 0.08)}
    >
      {children}
    </motion.section>
  );
}
