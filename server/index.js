const express = require('express')
const mongoose = require('mongoose')
const app = express();
const PORT = 5005
const userRoutes = require("./routes/userRoute")
const workspaceRoutes = require('./routes/workspaceRoute');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const passport = require('passport');
const session = require('express-session');
const Oauth2Strategy = require('passport-google-oauth2').Strategy;
const googleUser = require('./models/GoogleUserModel');
const cors = require('cors');
const workspaceData = require('./models/workspaceModel');

const Clientid = "103362471967-gj354jf3bqp4l7m4a0fu5mddng1i9nk3.apps.googleusercontent.com";
const Clientsecret = "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";

const server = app.listen(PORT, () => {
    console.log("server connected")
})
mongoose.connect('mongodb+srv://meetashgoyal:MoWEvWaO5JOknEKV@cluster0.n5xtt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log("Db connected")
    })
    .catch((error) => {
        console.log(error)
    })
//cors set
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PULL,DELETE",
    credentials: true
}))

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(userData);
        socket.emit("connected");
    });

    socket.on('join chat',(room) => {
        socket.join(room);
        console.log("User joined room : "+room);
    });
    
    socket.on("new message", (newReceivedMessage) => {
        const chat = newReceivedMessage.chat;
        if (!chat.users) {
            return console.log("Chat users not defined");
        }
        chat.users.forEach((user) => {
            if (user._id === newReceivedMessage.sender._id){
                console.log(`${newReceivedMessage.sender._id} i m sender`);
                return;
            };
            io.in(user._id).emit("message received", newReceivedMessage);
        });
    });
});


app.use(express.urlencoded())
app.use(express.json())
app.use('/api/users', userRoutes);
app.use('/api/workspace', workspaceRoutes);

//setting msgs and socketio for chatting
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);


//setupsession
app.use(session({
    secret: "kjfdndsJVHJVJH12132132",
    resave: false,
    saveUninitialized: true
}))

//setup passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new Oauth2Strategy({
        clientID: Clientid,
        clientSecret: Clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await googleUser.findOne({ GoogleId: profile.id });
                if (!user) {
                    user = new googleUser({
                        GoogleId: profile.id,
                        Name: profile.displayName,
                        email: profile.emails[0].value,
                        Image: profile.photos[0].value
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        })
)

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: 'http://localhost:3000/login'
}),
    async (req, res) => {
        try {
            const user = req.user;
            const token = await user.generateAuthToken();
            res.cookie("jswtoken", token, {
                path: '/',
                expires: new Date(Date.now() + 25892000000)
            });
            res.redirect('http://localhost:3000/');
        } catch (error) {
            console.log(error);
        }
    }
)

//loginnnn google
app.get("/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "user logined",
            user: req.user
        })
    }
    else {
        res.status(400).json({
            message: "not found"
        })
    }
})

//get email for steps
app.get('/getEmail', async (req, res) => {
    const token = req.query.token;
    const user = await googleUser.findOne({ "tokens.token": token });
    if (user) {
        res.status(200).json({
            message: "email user found",
            user: user
        })
    }
    else {
        res.status(900).json({
            message: "not found"
        })
    }
})

//logout
app.get("/logout", (req, res, next) => {
    req.logout(function (error) {
        if (error) { return next(error) }
        res.redirect("http://localhost:3000");
    })
})


//get workspace
app.get('/getWorkData', async (req, res) => {
    try {
        const work = req.query.projectWork;
        const workSpace = await workspaceData.findOne({ work: work });
        if (workSpace) {
            res.json({
                message: "data found",
                data: workSpace
            })
        }
    } catch (error) {
        console.log("not request gone");
    }
})

//get all workspaces at get started page
app.get('/getAllWorkspaces', async (req, res) => {
    try {
        const email = req.query.email;
        var allWorkspacesData = await workspaceData.find({ teamMembers: email });
        allWorkspacesData = Object.values(allWorkspacesData);
        if (allWorkspacesData.length > 0) {
            res.json({
                message: "all workspace Data found",
                data: { allWorkspacesData }
            })
        }
    } catch (error) {
        console.log(error)
    }
})

//deleting a workspace
app.get('/deleteWorkspace', async (req, res) => {
    try {
        const id = req.query.id;
        const isDeleted = await workspaceData.deleteOne({ _id: id });
        if (isDeleted) {
            res.json({
                message: "WorkSpace Deleted Succesfully!"
            })
        }
    } catch (error) {
        console.log(error);
    }
});

//getting all user data
app.get('/usersFind', async (req, res) => {
    const userEmail = req.query.email;
    const search = req.query.search
        ? {
            $or: [
                { Name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ]
        }
        : {};
    const users = await googleUser.find(search).find({ email: { $ne: userEmail } });
    const Users = Object.values(users);
    res.send(Users);
})

