import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/overview">Back to overview</Link>
    </section>
  );
}
