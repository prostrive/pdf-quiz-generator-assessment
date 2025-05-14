import { UploadPDF } from '@/components/ui/uploadPDF'

export default function Home() {
	return (
		<main className='grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
			<h1 className='text-4xl font-bold'>PDF Quiz Generator</h1>
			<UploadPDF />
		</main>
	)
}
