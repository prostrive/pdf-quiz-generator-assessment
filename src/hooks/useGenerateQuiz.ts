import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import type { IAPIHook, IQueryProps } from '@/types'
import { serverRequestErrExtractor } from '@/helpers'
import { QuizRequest, QuizResponse } from '@/schema'
import { withCatchAsync } from '@/lib/utils'

export const generateQuizFromText = async (data: QuizRequest) => {
  const response = await axios.post<QuizResponse>('/api/generate-quiz', { text: data.text })
  return response.data
}

export const useGenerateQuiz = ({
  showMessage = true,
  onSuccess,
  onError,
}: IAPIHook<QuizResponse, string> & IQueryProps = {}) => {
  const queryClient = useQueryClient()

  return useMutation<QuizResponse, string, QuizRequest>({
    mutationKey: ['quiz', 'generate'],
    mutationFn: async (request: QuizRequest) => {
      const [err, data] = await withCatchAsync(generateQuizFromText(request))
      if (err) {
        const errorMessage = serverRequestErrExtractor({ error: err })
        if (showMessage) toast.error(errorMessage)
        onError?.(errorMessage)
        throw errorMessage
      }
      if (showMessage) toast.success('Quiz successfully generated!')
      onSuccess?.(data)
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
      return data
    },
  })
}