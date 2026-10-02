// Data bank for Solo & 1v1 Quiz Modes (WAEC / SS standard questions)
const quizQuestions = [
    // --- ENGLISH LANGUAGE ---
    {
        id: 1,
        subject: "English",
        question: "Choose the option that best completes the sentence: Neither the students nor the teacher ____ present at the meeting.",
        options: ["was", "were", "are", "have been"],
        correct: 0,
        explanation: "When subjects are joined by 'neither... nor', the verb agrees with the subject closest to it ('the teacher' is singular, so 'was')."
    },
    {
        id: 2,
        subject: "English",
        question: "Identify the grammatical function of the underlined phrase: 'The boy *who won the race* received a scholarship.'",
        options: ["Noun phrase", "Adjectival clause", "Adverbial clause", "Prepositional phrase"],
        correct: 1,
        explanation: "'who won the race' is a relative clause modifying the noun 'boy', acting as an adjectival clause."
    },
    {
        id: 3,
        subject: "English",
        question: "Select the word nearest in meaning to 'OBSTINATE':",
        options: ["Flexible", "Stubborn", "Generous", "Polite"],
        correct: 1,
        explanation: "'Obstinate' means refusing to change one's opinion or course of action; stubborn."
    },

    // --- PHYSICS ---
    {
        id: 4,
        subject: "Physics",
        question: "Which of the following is a fundamental quantity in SI units?",
        options: ["Force", "Electric Current", "Velocity", "Work"],
        correct: 1,
        explanation: "Electric Current (measured in Amperes) is one of the seven fundamental SI base quantities."
    },
    {
        id: 5,
        subject: "Physics",
        question: "A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?",
        options: ["2 m/s²", "4 m/s²", "5 m/s²", "10 m/s²"],
        correct: 1,
        explanation: "Using a = (v - u) / t => a = (20 - 0) / 5 = 4 m/s²."
    },
    {
        id: 6,
        subject: "Physics",
        question: "At what launch angle is the horizontal range of a projectile maximum?",
        options: ["30°", "45°", "60°", "90°"],
        correct: 1,
        explanation: "Range R = (u² sin 2θ) / g. Sin 2θ reaches maximum value (1) when 2θ = 90°, so θ = 45°."
    },

    // --- CHEMISTRY ---
    {
        id: 7,
        subject: "Chemistry",
        question: "What is the atomic number of Element X if its electronic configuration is 1s² 2s² 2p⁶ 3s² 3p¹?",
        options: ["11", "13", "15", "17"],
        correct: 1,
        explanation: "Sum of electrons = 2 + 2 + 6 + 2 + 1 = 13 (Aluminum)."
    },
    {
        id: 8,
        subject: "Chemistry",
        question: "Which type of chemical bond involves the complete transfer of valence electrons?",
        options: ["Covalent bond", "Ionic bond", "Metallic bond", "Dative bond"],
        correct: 1,
        explanation: "Ionic (electrovalent) bonds are formed by the transfer of electrons from a metal to a non-metal."
    },
    {
        id: 9,
        subject: "Chemistry",
        question: "Across a period in the Periodic Table, atomic radius generally:",
        options: ["Increases", "Decreases", "Remains constant", "Fluctuates randomly"],
        correct: 1,
        explanation: "Atomic radius decreases across a period due to increased nuclear charge pulling electrons closer."
    },

    // --- MATHEMATICS ---
    {
        id: 10,
        subject: "Mathematics",
        question: "Find the roots of the quadratic equation: x² - 5x + 6 = 0.",
        options: ["x = -2, -3", "x = 2, 3", "x = 1, 6", "x = -1, -6"],
        correct: 1,
        explanation: "(x - 2)(x - 3) = 0 => x = 2 or x = 3."
    },
    {
        id: 11,
        subject: "Mathematics",
        question: "Evaluate log₂ 32.",
        options: ["3", "4", "5", "6"],
        correct: 2,
        explanation: "2⁵ = 32, therefore log₂ (2⁵) = 5."
    },
    {
        id: 12,
        subject: "Mathematics",
        question: "If the discriminant (b² - 4ac) of a quadratic equation is negative, the roots are:",
        options: ["Real and equal", "Real and distinct", "Complex / Imaginary", "Zero"],
        correct: 2,
        explanation: "A negative discriminant under the square root in the quadratic formula results in complex or non-real roots."
    },

    // --- BIOLOGY ---
    {
        id: 13,
        subject: "Biology",
        question: "Which organelle is referred to as the 'powerhouse' of the cell?",
        options: ["Ribosome", "Golgi Body", "Mitochondrion", "Nucleolus"],
        correct: 2,
        explanation: "Mitochondria synthesize ATP through cellular respiration, supplying power to the cell."
    },
    {
        id: 14,
        subject: "Biology",
        question: "The movement of water molecules from a region of lower solute concentration to higher solute concentration across a semi-permeable membrane is:",
        options: ["Diffusion", "Osmosis", "Active Transport", "Plasmolysis"],
        correct: 1,
        explanation: "This is the precise definition of Osmosis."
    },
    {
        id: 15,
        subject: "Biology",
        question: "Which tissue in vascular plants is primarily responsible for transporting manufactured food from leaves to other parts?",
        options: ["Xylem", "Phloem", "Cambium", "Epidermis"],
        correct: 1,
        explanation: "Phloem transports organic nutrients (sucrose/amino acids), while Xylem transports water and minerals."
    }
];
