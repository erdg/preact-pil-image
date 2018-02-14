import './spectre.min.css';
import { Component } from 'preact';

export default class App extends Component {
   state = {
      name: '',
      file: '',
      imgURL: '',
   }

   handleNameChange = (e) => {
      this.setState({ name: e.target.value });
   }

   handleFileChange = (e) => {
      console.log(e);
      this.setState({ file: e.target.files[0] });
   }

   handlePostUser = () => {
      fetch("http://localhost:4040/!newUser?" + this.state.name)
         .then( r => r.json() )
         .then( j => console.log(j) );
   }

   // Base64 data URL
   handlePostImage = () => {

      let reader = new FileReader();

      reader.onload = (e) => {

         console.log(e.target.result);

         // NOTE - must remove padding for picolisp
         //
         // base64 strings are padded with one or two '='s to make sure it aligns
         // to proper byte boundaries. the picolisp server does not handle this 
         // well. so we must remove any padding before it is sent. after picolisp
         // has parsed the http request, we can add the appropriate padding back
         // to the string by checking if it is an even multiple of 4.
         //
         // see 'server.l' for the picolisp side.
         //
         // NOTE - turns out that we don't need to add padding back on the server
         // as the base64 utility is still able to decode.

         // base64 string without padding
         let str = e.target.result.split('=')[0]

         // sends the data in the URL, broken for large files
         //
         // fetch("http://localhost:4040/!postImage?" + this.state.name + "&" + str)
         //    .then( r => r.json() )
         //    .then( j => console.log(j) );
         

         // sends data in body of POST
         // works with adapted http.l
         //
         fetch("http://localhost:4040/!postImage?" + this.state.name, 
            { 
               method: "POST", 
               // body: e.result.target
               body: JSON.stringify({ image: str }) 
            }
         )
            .then( r => r.json() )
            .then( j => console.log(j) );

      };

      reader.readAsDataURL(this.state.file);

   }

   handlePostImageBlob = () => {

      let reader = new FileReader();

      reader.onload = (e) => {

         console.log(e.target.result);

         fetch("http://localhost:4040/!postImage2?" + this.state.name, { method: 'POST', body: e.target.result })
            .then( r => r.json() )
            .then( j => console.log(j) );

      }

      reader.readAsArrayBuffer(this.state.file);

   }

   handleLoadImage = () => {
      fetch("http://localhost:4040/!getImage?" + this.state.name)
         .then( r => r.text() )
         .then( text => {
            console.log(text);
            console.log(text.length);
            this.setState({ imgURL: text });
         });
   }

   handleLoadImageBlob = () => {
      fetch("http://localhost:4040/!getImage?" + this.state.name)
         .then( r => r.blob() )
         .then( blob => {
            console.log(blob);
            var blobURL = URL.createObjectURL(blob);
            console.log(blobURL);
            this.setState({ imgURL: blobURL });
         });
   }


	render() {
      let file = this.state.file;
      let name = this.state.name;
		return (
			<div>

            <Avatar 
               data-initial="EG" 
               src={this.state.imgURL}
            />

            <form class="form-group">

               <input 
                  class="form-input"
                  type="text"
                  value={name}
                  onChange={this.handleNameChange}
                  placeholder="User Name"
               />

               <input 
                  id="filechooser"
                  class="form-input mx-2"
                  type="file" 
                  accept=".jpg, .jpeg, .png"
                  value={file} 
                  onChange={this.handleFileChange}
               />

            </form>

            <button
               class="btn btn-primary mx-2"
               onClick={this.handlePostImage}
            >
               Post image to server
            </button>

            <button
               class="btn btn-primary mx-2"
               onClick={this.handleLoadImageBlob}
            >
               Load image from server
            </button>

            <button
               class="btn btn-primary mx-2"
               onClick={this.handlePostUser}
            >
               New User
            </button>
         
			</div>
		);
	}
}

const Avatar = (props) => (
   <figure 
      class={ props.class ? "avatar " + props.class : "avatar avatar-xl" } 
   >
      <img src={props.src} />
   </figure>
)
