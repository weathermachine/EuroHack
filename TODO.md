### App 
I want to create my own strudel-based music creation app. Instead of directly coding strudel to change notes, parameters, beats, structure, etc., I want to be able to chat with a Claude-based AI interface that lets me change any aspects of the music while it is playing to be a continuous dj/producer. 

### Description of the app
The app is web-based app that I can also test as a standlone electron app. The interface shows me the strudel code and inline visualizations from the strudel code in a repl window. To the right is another window that displays synced visualizations that can also be customized by chatting with the AI interface. On the bottom is the chat interface that speaks with Claude. Claude then changes the strudel code or the visualization code accordingly and seamlessly updates the music and visualizations. The whole app can look like a simple terminal. But with the code, inline visualizations, visualization window, and text effects, it looks like a fully animated, dynamics, and responsive terminal unlike a standard terminal.


### Team composition
Create an agent team to develop this app. Our first agent should be in charge of the application architecture and coordinate with all the agents on how to develop in the architecture. One agent should be in charge of creating the UX. Another agent should be in charge of understanding the strudel project (documented here: https://strudel.cc/workshop/getting-started/), finding the best way to integrate it into our app, and interpreting the user requests. Another agent should be in charge of integrating Claude into the App for the AI interface, understanding how to interact with the Strudel component and with the visualization component. Another agent should be in charge of determining what the most useful library would be for an application like this given that we want real time graphics visualizations that sync to the beat, waveforms, audio, etc. 

