
// Check if the code has been executed before
if (!localStorage.getItem('youtubeAdBlockExecuted')) {
  // Set the cookie to block YouTube ads
  document.cookie = "VISITOR_INFO1_LIVE=oKckVSqvaGw; path=/; domain=.youtube.com";
  // Set a flag in localStorage to indicate that the code has been executed
  localStorage.setItem('youtubeAdBlockExecuted', 'true');
  // Reload the page
  window.location.reload();
}

console.log("reloaded")




