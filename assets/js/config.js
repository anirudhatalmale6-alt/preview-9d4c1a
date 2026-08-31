/* =====================================================================
   Site — SITE CONFIG
   This is the only file you need to touch for the everyday settings.
   ===================================================================== */

window.SITE_CONFIG = {

  /* -------------------------------------------------------------------
     1) WHERE APPLICATIONS AND SUBSCRIBERS ARE SENT
     Put your own email address between the quotes.

     The forms are sent through FormSubmit (formsubmit.co) — free, no
     account, works on any hosting. The VERY FIRST time someone submits,
     FormSubmit emails you a one-click confirmation link. Click it once
     and every later application (CV attached) lands in your inbox.
  ------------------------------------------------------------------- */
  applicationsEmail: "REPLACE-WITH-YOUR-EMAIL@example.com",

  /* -------------------------------------------------------------------
     1b) OPTIONAL — send through your own server instead of FormSubmit.
     Only for hosting that runs PHP. Set this to true AND put your
     address at the top of send.php.
  ------------------------------------------------------------------- */
  useServerScript: false,

  /* -------------------------------------------------------------------
     2) THE TEAM FILM
     Three ways to run it. Fill in ONE.

     a) YouTube  — paste just the video ID (the bit after "v=")
        video: { type: "youtube", id: "dQw4w9WgXcQ" }

     b) Vimeo    — paste just the numeric ID
        video: { type: "vimeo", id: "123456789" }

     c) Your own MP4 — drop the file in assets/video/ and point at it
        video: { type: "mp4", src: "assets/video/team-film.mp4" }

     Leave type as "" and the page shows the poster frame with a play
     button, and clicking it says the film is coming soon.

     "duration" is only the label printed on the poster (e.g. "1:45").
     "poster" is optional — leave it out to use assets/img/poster-*.jpg
  ------------------------------------------------------------------- */
  video: {
    type: "",
    id: "",
    src: "",
    duration: "1:45"
  },

  /* -------------------------------------------------------------------
     3) SOCIAL LINKS
     Paste your full profile URLs. Any left empty is hidden from the page.
  ------------------------------------------------------------------- */
  social: {
    instagram: "",
    youtube: "",
    facebook: ""
  },

  /* -------------------------------------------------------------------
     4) GOOGLE ANALYTICS 4
     Paste your GA4 Measurement ID (looks like "G-AB12CD34EF").
     Leave it empty ("") and no tracking script is loaded at all.
  ------------------------------------------------------------------- */
  ga4MeasurementId: ""

};
