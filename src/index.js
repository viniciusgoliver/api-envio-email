const express = require("express");
const nodemailer = require("nodemailer");

const configs = require("./config/mail");

const app = express();


// body parser middleware
app.use(express.json());
app.use(express.urlencoded( { extended: false } )); // this is to handle URL encoded data
// end parser middleware


// custom middleware to log data access
const log = function (request, response, next) {
	console.log(`${new Date()}: ${request.protocol}://${request.get('host')}${request.originalUrl}`);
	console.log(request.body); // make sure JSON middleware is loaded first
	next();
}
app.use(log);
// end custom middleware


// HTTP POST
app.post("/envia-contato", function(request, response) {
  // create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: configs.HOST,
		port: configs.PORT,
		secure: configs.SECURE,
    auth: {
      user: configs.USER,
      pass: configs.PASS
		}
	});

	const textBody = `DE: ${request.body.nome} EMAIL: ${request.body.email} MENSAGEM: ${request.body.mensagem}`;
	const htmlBody = `<h2>Email via Formulário de Contato</h2><p>${request.body.nome} - ${request.body.empresa}</p><p>${request.body.mensagem}</p>`;
	const mail = {
		from: request.body.email, // sender address
		to: "admin@localhost.com", // list of receivers (THIS COULD BE A DIFFERENT ADDRESS or ADDRESSES SEPARATED BY COMMAS)
		subject: "Contato via Site", // Subject line
		text: textBody,
		html: htmlBody
	};

	// send mail with defined transport object
	transporter.sendMail(mail, function (err, info) {
		if(err) {
			console.log(err);
			response.json({ message: "message not sent: an error occured; check the server's console log" });
		}
		else {
			response.json({ message: `message sent: ${info.messageId}` });
		}
	});
});


// set port from environment variable, or 8000
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));