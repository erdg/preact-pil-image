(load "http.l" "json.l")

(class +User +Entity)
(rel nm (+Ref +String))
(rel img (+Blob))

(de newUser (Nm)
   (with (new! '(+User) 'nm Nm)
      (respondJson (list (cons 'nm (: nm)))) ) )

# THIS WORKS!
# Nm - name of +User
#
# converts the base64 string to the image binary and saves it
# in the database.
#
# HTTP POST payload data is now in *Post
(de postImage (Nm)
   (out 2 (println Nm))
   (out 2 (println *Post))
   (with (db 'nm '+User Nm)
      (put!> This 'img T)
      ### get the post data here
      (let Url (cdr (assoc "image" (json~decode *Post)))
         ### any post-processing goes here
         (finally (resizeImage (blob This 'img) "200x200")
            (pipe
               ### send to base64 utility to decode
               (out '(base64 "-d") 
                  ## remove "data:image/<type>;base64," from URL
                  (prin (pack (stem (chop Url) ",") ) ) )
               ### write decoded image to db blob file
               (out (blob This 'img)
                  (echo) ) ) ) )
      ### json response goes here
      (respondJson '((ok . "it worked"))) ) )

### this function is not necessary. the 'base64' command line utility 
### is able to decode even without the proper padding. however it will 
### print "base64: invalid input" to stderr, thus cluttering your log
### file in a PL application using httpGate.
(de padBase64Str (Str)
   ## add necessary padding
   (case (% (length Str) 3)
      (1 (pack (append Str '(= =))))
      (2 (pack (append Str '(=))))
      (T (pack Str)) ) )

# Usage - (resizeImage (blob ... 'img) "200x200")
(de resizeImage (File Size)
   # get size from 'identify' command line utility
   (unless (= Size (pack (caddr (str (in (list 'identify File) (line T))))))
      (call 'mogrify "-resize" Size File) ) )


(de getImage (Nm)
   (let File (blob (db 'nm '+User Nm) 'img)
      (http1 "image/jpeg" 0)
      #(prinl "Content-Encoding: base64^M")
      (prinl "Access-Control-Allow-Origin: *^M")
      (prinl "Content-Length: " (car (info File)) "^M^J^M")
      (prin (in (blob (db 'nm '+User Nm) 'img) (echo))) ) )


(de respondJson (Lst)
   (let Json (json~encode Lst)
      (http1 "application/json" 0)
      (prinl "Access-Control-Allow-Origin: *^M")
      (prinl "Content-Length: " (size Json) "^M^J^M")
      (prin Json) ) )


(de main ()
   (setq *Blob "db/blob/")
   (call "mkdir" "-p" "db/" *Blob)
   (pool "db/app.db" *Dbs) )


(de go () (server 4040)) 
