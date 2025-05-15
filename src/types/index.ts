type Questionnaire = {
  question: string
  choices: string[]
}

type FormValues = {
  answer1: string
  answer2: string
  answer3: string
  answer4: string
  answer5: string
}

export type { Questionnaire, FormValues }
