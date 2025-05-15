import { z } from "zod"

const FormSchema = z.object({
  answer1: z
    .string({
      required_error: "Please select an answer.",
    })
    .min(1, "Please select an answer."),
  answer2: z
    .string({
      required_error: "Please select an answer.",
    })
    .min(1, "Please select an answer."),
  answer3: z
    .string({
      required_error: "Please select an answer.",
    })
    .min(1, "Please select an answer."),
  answer4: z
    .string({
      required_error: "Please select an answer.",
    })
    .min(1, "Please select an answer."),
  answer5: z
    .string({
      required_error: "Please select an answer.",
    })
    .min(1, "Please select an answer."),
})

export { FormSchema }
