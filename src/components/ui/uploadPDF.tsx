import { Button } from './button'

function UploadPDF() {
	return (
		<div className='flex flex-col gap-1'>
			<label htmlFor='upload-pdf'>Upload PDF</label>
			<input
				className='border-gray-400 border-2 rounded-md p-1 cursor-pointer'
				type='file'
				name='upload-pdf'
				id='upload-pdf'
				placeholder='asdfadf'
			/>
			<Button type='button'>Generate Quiz</Button>
		</div>
	)
}

export { UploadPDF }
