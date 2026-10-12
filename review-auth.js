(() => {
 'use strict';
 const url=new URL(location.href),session=url.searchParams.get('giscus'),flow=url.searchParams.get('flow');
 // The provider returns an encrypted session, never a raw GitHub access token.
 // Keep it out of history, logs, messages and public counts.
 history.replaceState(null,document.title,location.pathname);
 try{
  const pending=JSON.parse(localStorage.getItem('stokes-review-auth-flow')||'null');
  if(!session||!flow||flow!==pending?.id||Date.now()>pending.expires)throw Error('Sign-in was cancelled or expired. Close this window and try again from the canvas.');
  localStorage.setItem('giscus-session',JSON.stringify(session));
  localStorage.removeItem('stokes-review-auth-flow');
  document.querySelector('#status').textContent='You are signed in. This window can close; your canvas has stayed open.';
  if(window.opener)window.opener.postMessage({stokesReviewAuth:'complete'},location.origin);
  window.close();
 }catch(e){document.querySelector('#status').textContent=e.message||'Sign-in could not complete. Try again from the canvas.';}
})();
