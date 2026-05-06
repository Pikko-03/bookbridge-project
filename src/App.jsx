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
import Community from "./pages/Community";
import ContactFeedback from "./pages/ContactFeedback";
import Terms from "./pages/Terms";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

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

  const getBookDocId = (book) => {
    return encodeURIComponent(book?.key || book?.title || Date.now());
  };

  const getReviewDocId = (bookKey) => {
    return encodeURIComponent(bookKey || Date.now());
  };

 useEffect(() => {
  const savedShelves = localStorage.getItem("bookbridgeShelves");
  const savedReviews = localStorage.getItem("bookbridgeReviews");
  const savedLastSearch = localStorage.getItem("bookbridgeLastSearch");
  const savedRecentlyViewed = localStorage.getItem("bookbridgeRecentlyViewed");
  const savedTheme = localStorage.getItem("bookbridgeTheme");

  if (savedShelves) setShelves(JSON.parse(savedShelves));
  if (savedReviews) setReviews(JSON.parse(savedReviews));
  if (savedLastSearch) setLastSearchQuery(savedLastSearch);
  if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  if (savedTheme) setTheme(savedTheme);

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setUser(userSnap.data());
    } else {
      const userData = {
        uid: firebaseUser.uid,
        name:
  firebaseUser.displayName ||
  firebaseUser.email?.split("@")[0] ||
  "BookBridge Reader",
        email: firebaseUser.email,
        joined: "2026",
        favoriteAuthor: "",
        readingGoal: 12,
        preferredGenres: [],
        bio: "",
      };

      await setDoc(userRef, userData);
      setUser(userData);
    }
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const loadShelvesFromFirestore = async () => {
      if (!user?.uid) return;

      try {
        const shelvesRef = collection(db, "users", user.uid, "shelves");
        const snapshot = await getDocs(shelvesRef);

        const firebaseShelves = { want: [], reading: [], read: [] };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          if (data.shelf && data.book && firebaseShelves[data.shelf]) {
            firebaseShelves[data.shelf].push(data.book);
          }
        });

        setShelves(firebaseShelves);
        localStorage.setItem("bookbridgeShelves", JSON.stringify(firebaseShelves));
      } catch (error) {
        console.error("Failed to load shelves:", error);
      }
    };

    loadShelvesFromFirestore();
  }, [user?.uid]);

  useEffect(() => {
    const loadReviewsFromFirestore = async () => {
      if (!user?.uid) return;

      try {
        const reviewsRef = collection(db, "users", user.uid, "reviews");
        const snapshot = await getDocs(reviewsRef);

        const firebaseReviews = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          if (data.bookKey) {
            firebaseReviews[data.bookKey] = {
  rating: data.rating,
  text: data.text,
  bookKey: data.bookKey,
  bookTitle: data.bookTitle || "Unknown Book",
  bookAuthor: data.bookAuthor || "Unknown Author",
  date: data.date,
  helpful: data.helpful || 0,
  updatedAt: data.updatedAt,
};
          }
        });

        setReviews(firebaseReviews);
        localStorage.setItem("bookbridgeReviews", JSON.stringify(firebaseReviews));
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };

    loadReviewsFromFirestore();
  }, [user?.uid]);

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

  const addToShelf = async (shelf, book) => {
    if (!user) {
      requireAuth("book", "Please log in to save books.");
      setSelectedBook(book);
      return;
    }

    const updatedBook = {
      ...book,
      addedAt: new Date().toISOString(),
    };

    setShelves((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].filter((b) => b.key !== book.key);
      });

      updated[shelf] = [...updated[shelf], updatedBook];

      localStorage.setItem("bookbridgeShelves", JSON.stringify(updated));

      return updated;
    });

    if (user?.uid) {
      try {
        const bookId = getBookDocId(book);

        await setDoc(doc(db, "users", user.uid, "shelves", bookId), {
          shelf,
          book: updatedBook,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to save shelf:", error);
        showToast("Saved locally, but Firebase failed");
        return;
      }
    }

    const label =
      shelf === "want"
        ? "Want to Read"
        : shelf === "reading"
        ? "Currently Reading"
        : "Read";

    showToast(`Added to ${label}`);
  };

  const removeFromShelf = async (book) => {
    setShelves((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].filter((b) => b.key !== book.key);
      });

      localStorage.setItem("bookbridgeShelves", JSON.stringify(updated));

      return updated;
    });

    if (user?.uid) {
      try {
        const bookId = getBookDocId(book);
        await deleteDoc(doc(db, "users", user.uid, "shelves", bookId));
      } catch (error) {
        console.error("Failed to remove shelf:", error);
        showToast("Removed locally, but Firebase failed");
        return;
      }
    }

    showToast("Removed from shelf");
  };

  const getShelf = (book) => {
    for (const [shelf, books] of Object.entries(shelves)) {
      if (books.find((b) => b.key === book?.key)) return shelf;
    }

    return null;
  };
const addReview = async (bookKey, review) => {
  if (!user) {
    requireAuth("book", "Please log in to write a review.");
    return;
  }

  const reviewData = {
    ...review,
    bookKey,
    // Fix: try all possible field names from Open Library API
    bookTitle: selectedBook?.title || review.bookTitle || "Unknown Book",
    bookAuthor:
      selectedBook?.author ||
      (Array.isArray(selectedBook?.authors)
        ? selectedBook.authors.map((a) => a.name || a).join(", ")
        : null) ||
      selectedBook?.author_name?.[0] ||
      review.bookAuthor ||
      "Unknown Author",
    date: review.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: review.helpful || 0,
    // ✅ ADD: save reviewer info
    reviewerName: user.name || "Anonymous",
    reviewerEmail: user.email || "",
    reviewerUid: user.uid || "",
  };

    setReviews((prev) => {
      const updated = { ...prev, [bookKey]: reviewData };
      localStorage.setItem("bookbridgeReviews", JSON.stringify(updated));
      return updated;
    });

    if (user?.uid) {
      try {
        const reviewId = getReviewDocId(bookKey);

        await setDoc(
          doc(db, "users", user.uid, "reviews", reviewId),
          reviewData
        );
      } catch (error) {
        console.error("Failed to save review:", error);
        showToast("Review saved locally, but Firebase failed");
        return;
      }
    }

    showToast("Review saved");
  };

  const handleLogin = (loggedInUser) => {
    
    setUser(loggedInUser);

    const target = redirectAfterAuth || "home";
    setPage(target);
    setAuthMessage("");
    showToast(`Welcome back, ${loggedInUser.name}`);
    window.scrollTo(0, 0);
  };

  const handleSignup = (newUser) => {
    
    setUser(newUser);

    const target = redirectAfterAuth || "home";
    setPage(target);
    setAuthMessage("");
    showToast(`Welcome to BookBridge, ${newUser.name}`);
    window.scrollTo(0, 0);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

const handleLogout = () => {
  setShowLogoutModal(true);
};

const confirmLogout = async () => {
  await signOut(auth);

  setUser(null);
  setShelves({ want: [], reading: [], read: [] });
  setReviews({});

  setShowLogoutModal(false);
  navigate("home");
};

const cancelLogout = () => {
  setShowLogoutModal(false);
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

        {page === "community" && <Community navigate={navigate} />}
{page === "contact" && <ContactFeedback navigate={navigate} />}
{page === "terms" && <Terms navigate={navigate} />}
{page === "admin" && (
  <AdminDashboard user={user} navigate={navigate} />
)}
{![
  "home",
  "search",
  "book",
  "mybooks",
  "profile",
  "ai",
  "about",
  "careers",
  "help",
  "login",
  "signup",
  "privacy",
  "terms",
  "community",
  "contact",
  "admin",
].includes(page) && <NotFound navigate={navigate} />}
        
      </main>

      <Footer navigate={navigate} />

      {toast && <div className="toast">{toast}</div>}
      {showLogoutModal && (
  <div className="modal-overlay">
    <div className="logout-modal">
      <div className="logout-modal-icon">↪</div>

      <h2>Log out?</h2>

      <p>
        Are you sure you want to log out of your BookBridge account?
      </p>

      <div className="logout-modal-actions">
        <button className="btn btn-secondary" onClick={cancelLogout}>
          Cancel
        </button>

        <button className="btn btn-danger" onClick={confirmLogout}>
          Yes, Log Out
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}