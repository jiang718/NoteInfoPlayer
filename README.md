# NoteInfoPlayer
A JavaScript plugin for playing a txt containing note info list for Digital Software reaper.

Put the plugin into "script" folder under the resource folder of reaper.
Put source txt into the resource folder of reaper.
For further reference, please refer to the offcial website of reaper https://www.reaper.fm/.

Each line in the source txt represented a MIDI event, please put those event in order.
Onset OnOrOff(0 or 1) TrackNumber(0-15) PitchNumber Velocity Duration
For example:
2.5 1 0 79 100 1
It means play a 79(G5) note at midi track 0 on time 2.5 with velocity 100 and duration 1.
For the unit of onset and duration, duration 1 means the length of one 16th note. onset 2.5 means from the starting point till the current point, the length is the length of 2.5*16th-note-length.

This is a middle ware plugin using a molecule sonification program data as input, and then send midi information to reaper to generate mp3 files.
