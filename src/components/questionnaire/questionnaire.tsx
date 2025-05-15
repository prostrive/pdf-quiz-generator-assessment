import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Questionnaire, FormValues } from "@/types"

type QuestionnaireProps = {
  form: UseFormReturn<FormValues>
  handleSubmitResult: () => Promise<string | number | undefined>
  questionnaire?: Questionnaire[] | null
  isLoading: boolean
}

const QuestionnaireForm = ({
  form,
  handleSubmitResult,
  questionnaire,
  isLoading,
}: QuestionnaireProps) => {
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 pt-10 w-full items-center justify-center h-full max-w-[800]"
        onSubmit={form.handleSubmit(handleSubmitResult)}
      >
        {isLoading ? (
          <div className="border-4 border-black animate-spin h-10 w-10 rounded-full border-t-transparent" />
        ) : (
          <ul className="flex flex-col gap-6">
            {questionnaire?.map((item, idx) => {
              const itemNumber = idx + 1
              return (
                <li className="flex flex-col gap-2" key={item.question}>
                  <FormField
                    control={form.control}
                    name={`answer${itemNumber}` as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="w-full">
                          {itemNumber}.) {item.question}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose the correct answer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {item.choices?.map((answer) => (
                                <SelectItem value={answer} key={answer}>
                                  {answer}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </li>
              )
            })}
          </ul>
        )}

        {questionnaire && (
          <Button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </Button>
        )}
      </form>
    </Form>
  )
}

export { QuestionnaireForm }
