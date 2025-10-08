import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to Bible page
  redirect('/bible');
}
