export enum MODULES {
	Creator_DivineGuidance = 1,
	Rasulullah_Aimmah,
	Ghaybah_SelfPurification,
	Wellbeing_Hereafter,
}

export const formatModule = (mod: MODULES) => {
	switch (mod) {
		case 1:
			return "1&2 - Creator And His Creation, Divine Guidance"
		case 2:
			return "3&4 - Rasulullah (SAW) Communcating The Message, A'immah (AS) Safeguarding The Message"
		case 3:
			return "5&6 - Upholding The Message During Ghaybah, Roadmap to Self-Purification"
		case 4:
			return "7&8 - Societal Wellbeing, The Hereafter - Return to The Creator"
	}
}
