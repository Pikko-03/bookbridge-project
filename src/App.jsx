import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import BookDetail from "./pages/BookDetail";
import MyBooks from "./pages/MyBooks";
import Profile from "./pages/Profile";
import AIRecommend from "./pages/AIRecommend";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Careers from "./pages/Careers";
import HelpCenter from "./pages/HelpCenter";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [shelves, setShelves] = useState({ want: [], reading: [], read: [] });
  const [reviews, setReviews] = useState({});
  const [user, setUser] = useState(null);

  const [authMessage, setAuthMessage] = useState("");
  const [redirectAfterAuth, setRedirectAfterAuth] = useState("home");

  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [theme, setTheme] = useState("light");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("bookbridgeUser");
    const savedShelves = localStorage.getItem("bookbridgeShelves");
    const savedReviews = localStorage.getItem("bookbridgeReviews");
    const savedLastSearch = localStorage.getItem("bookbridgeLastSearch");
    const savedRecentlyViewed = localStorage.getItem("bookbridgeRecentlyViewed");
    const savedTheme = localStorage.getItem("bookbridgeTheme");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedShelves) setShelves(JSON.parse(savedShelves));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedLastSearch) setLastSearchQuery(savedLastSearch);
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("bookbridgeShelves", JSON.stringify(shelves));
  }, [shelves]);

  useEffect(() => {
    localStorage.setItem("bookbridgeReviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("bookbridgeLastSearch", lastSearchQuery);
  }, [lastSearchQuery]);

  useEffect(() => {
    localStorage.setItem("bookbridgeRecentlyViewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("bookbridgeTheme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const requireAuth = (targetPage = "home", message = "Please log in to continue.") => {
    setRedirectAfterAuth(targetPage);
    setAuthMessage(message);
    setPage("login");
    window.scrollTo(0, 0);
  };

  const navigate = (p, data = null) => {
    if ((p === "mybooks" || p === "profile") && !user) {
      requireAuth(p, "Please log in to view this page.");
      return;
    }

    setPage(p);

    if (data) {
      setSelectedBook(data);

      if (p === "book" && data?.key) {
        setRecentlyViewed((prev) => {
          const filtered = prev.filter((item) => item.key !== data.key);
          return [data, ...filtered].slice(0, 8);
        });
      }
    }

    if (p !== "login" && p !== "signup") {
      setAuthMessage("");
    }

    window.scrollTo(0, 0);
  };

  const addToShelf = (shelf, book) => {
    if (!user) {
      requireAuth("book", "Please log in to save books.");
      setSelectedBook(book);
      return;
    }

    setShelves((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].filter((b) => b.key !== book.key);
      });

      updated[shelf] = [...updated[shelf], book];
      return updated;
    });

    const label =
      shelf === "want"
        ? "Want to Read"
        : shelf === "reading"
        ? "Currently Reading"
        : "Read";

    showToast(`Added to ${label}`);
  };

  const removeFromShelf = (book) => {
    setShelves((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].filter((b) => b.key !== book.key);
      });

      return updated;
    });

    showToast("Removed from shelf");
  };

  const getShelf = (book) => {
    for (const [shelf, books] of Object.entries(shelves)) {
      if (books.find((b) => b.key === book?.key)) return shelf;
    }

    return null;
  };

  const addReview = (bookKey, review) => {
    if (!user) {
      requireAuth("book", "Please log in to write a review.");
      return;
    }

    setReviews((prev) => ({ ...prev, [bookKey]: review }));
    showToast("Review saved");
  };

  const handleLogin = (loggedInUser) => {
    localStorage.setItem("bookbridgeUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    const target = redirectAfterAuth || "home";
    setPage(target);
    setAuthMessage("");
    showToast(`Welcome back, ${loggedInUser.name}`);
    window.scrollTo(0, 0);
  };

  const handleSignup = (newUser) => {
    localStorage.setItem("bookbridgeUser", JSON.stringify(newUser));
    setUser(newUser);

    const target = redirectAfterAuth || "home";
    setPage(target);
    setAuthMessage("");
    showToast(`Welcome to BookBridge, ${newUser.name}`);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("bookbridgeUser");
    setUser(null);
    setPage("home");
    setAuthMessage("");
    showToast("Logged out");
    window.scrollTo(0, 0);
  };

  const totalBooks = Object.values(shelves).flat().length;

  return (
    <div className={`app theme-${theme}`}>
      <Header
        page={page}
        navigate={navigate}
        totalBooks={totalBooks}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        lastSearchQuery={lastSearchQuery}
        setLastSearchQuery={setLastSearchQuery}
      />

      <main className="main-content">
        {(page === "login" || page === "signup") && authMessage && (
          <div className="alert alert-info auth-notice">{authMessage}</div>
        )}

        {page === "home" && (
          <Home
            navigate={navigate}
            shelves={shelves}
            user={user}
            recentlyViewed={recentlyViewed}
            addToShelf={addToShelf}
            removeFromShelf={removeFromShelf}
            getShelf={getShelf}
          />
        )}

        {page === "search" && (
          <Search
            navigate={navigate}
            addToShelf={addToShelf}
            removeFromShelf={removeFromShelf}
            getShelf={getShelf}
            user={user}
            lastSearchQuery={lastSearchQuery}
            setLastSearchQuery={setLastSearchQuery}
          />
        )}

        {page === "book" && selectedBook && (
          <BookDetail
            book={selectedBook}
            navigate={navigate}
            addToShelf={addToShelf}
            removeFromShelf={removeFromShelf}
            getShelf={getShelf}
            review={reviews[selectedBook.key]}
            addReview={addReview}
            user={user}
            shelves={shelves}
          />
        )}

        {page === "mybooks" &&
          (user ? (
            <MyBooks
              shelves={shelves}
              navigate={navigate}
              removeFromShelf={removeFromShelf}
              reviews={reviews}
              user={user}
            />
          ) : (
            <Login navigate={navigate} onLogin={handleLogin} />
          ))}

        {page === "profile" &&
          (user ? (
            <Profile
              user={user}
              shelves={shelves}
              reviews={reviews}
              navigate={navigate}
            />
          ) : (
            <Login navigate={navigate} onLogin={handleLogin} />
          ))}

        {page === "ai" && (
  <AIRecommend
    navigate={navigate}
    shelves={shelves}
    user={user}
    addToShelf={addToShelf}
    removeFromShelf={removeFromShelf}
    getShelf={getShelf}
  />
)}

{page === "about" && <About navigate={navigate} />}
{page === "careers" && <Careers navigate={navigate} />}
{page === "help" && <HelpCenter navigate={navigate} />}

        {page === "login" && <Login navigate={navigate} onLogin={handleLogin} />}

        {page === "signup" && (
          <Signup navigate={navigate} onSignup={handleSignup} />
        )}
 
      </main>
<Footer navigate={navigate} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}