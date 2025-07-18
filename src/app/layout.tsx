import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
	title: "PDF Quiz Generator",
	description: "Generate quizzes from PDFs",
};

export default function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>
				<Toaster position="bottom-center" />
				{children}
			</body>
		</html>
	);
}
