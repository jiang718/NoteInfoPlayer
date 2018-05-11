desc:Txt To Midi

slider1:/TxtData:pitchDataPentatonic.txt:Note
slider2:0<0,1,1{No,Reload Now}>Reload Mapping 

@init
bpos=0;
statNoteOn = $x90;
statNoteOff = $x80;
index = 0;    //initial index for noteData
firstLoad = 1;//whether it's the first time to load
noteData = -1;
//0: onset   1: on/off  2: pitch   3: velocity   4: track
dataSize = 6;
#msg;#timemsg;
#notemsg;#velocitymsg;#onsetmsg;#trackmsg;
#PitchStr;
intStrAddress=10;
floatStrAddress=50;
msgPresetAddress=100;
infoPresentAddress=300;
info = 3000; //
arrayCount = 0;
i;
//0[0] = onset
//0[1] = on / off
//0[2] = pitch
//0[3] = velocity
//0[4] = track

function IsSpace(value) (
  value == 32;
);

function IsDot(value) (
  value == 46;
);

function GetNumber(str, offset) (
  str_getchar(str, offset, 'cu') - 48;
);

function IsEnd(value) (
  //10: /n   13: /r
  //linux: only /n
  //windows: /r/n
  //mac : only /r
  value == 10 || value == 13 || value == 26;
);

function IsNumber(value) (
  value - 48 >= 0 && value - 48 <= 9;
);

function HasMeaning(value) (
  //either a number || a space || a dot
  IsNumber(value) || IsSpace(value) || IsDot(value) || IsEnd(value);
);

function GetSubStr(str, offset, len) (
  temp = len + 1;
  strcpy_substr(temp,str,offset,len);
  temp;
);

function GetFloatStr(x) (
  //tempStr: 1000
  tempStr = floatStrAddress;
  sprintf(tempStr, "%.1f", x);
  tempStr;
);


function GetIntStr(x) (
  //tempStr: 1000
  tempStr = intStrAddress;
  x=floor(x);
  sprintf(tempStr, "%d", x);
  tempStr;
);


function LoadData() (
  firstLoad = 0;
  arrayCount = 0;
  index=0;
  strcpy(#msg, "Load Notes: ");
  strcat(#msg, "\r\n");
  noteData = file_open(slider1);
  
  //read from file
  while (file_avail(noteData)) (
    file_string(noteData, #buf);
    !(strcmp(#buf,"")==0) ? (
    infoTemp = 800;
    arrayCountTemp = 0;
    //strcat(#buf, " 232");
    i = 0;
    hasStore = 1; //set to 0 after reading first number char
    currentNum = 0.0; 
    tens = 1.0;
    DotExist = 0;
    //strcat(#msg, "note event:");
    //strcat(#msg, GetIntStr(arrayCount / 2 + 1));
    //strcat(#msg, " : ");
    while (HasMeaning(str_getchar(#buf, i, 'cu'))) (
      value = str_getchar(#buf, i, 'cu');
      IsSpace(value) || IsEnd(value) ? (
        hasStore == 0 ? (
          hasStore = 1;
          info[arrayCount * dataSize + arrayCountTemp] = currentNum / tens;
          //strcat(#msg, GetFloatStr(info[arrayCount * dataSize + arrayCountTemp]));
          //strcat(#msg, " ");
          arrayCountTemp += 1;
          currentNum = 0;
          tens = 1;
          DotExist = 0;
        );
      ) : (
        hasStore = 0;
        DotExist ? (
          tens *= 10;
        );
        IsDot(value) ? (
          DotExist = 1;
        ) : (
          currentNum = currentNum * 10 + GetNumber(#buf, i);
        );
      );
      i += 1;
    );
    hasStore == 0 ? (
      hasStore = 1;
      info[arrayCount * dataSize + arrayCountTemp] = currentNum / tens;
      //strcat(#msg, GetFloatStr(info[arrayCount * dataSize + arrayCountTemp]));
      //strcat(#msg, " ");
      arrayCountTemp += 1;
    );
    //strcat(#msg, "\r\n");
    arrayCount += 1;
    );
  );
  strcat(#msg, GetIntStr(arrayCount));
  strcat(#msg, "\r\n");
);

function DataIsOver(noteData, arrayCount, dataSize, index) (
  index > arrayCount * dataSize;
);

function GetMsgPreset(arrayCount) (
  tempStr = msgPresetAddress;
  strcpy(tempStr, "Total Notes:\r\n");
  //strcat(tempStr, GetIntStr(arrayCount / 2));
  strcat(tempStr, "\r\n");
  tempStr;
);

//infoType: 0-float  1-int
function GetInfoStr(info, value, infoType) (
  tempStr = infoStrAddress;
  strcpy(tempStr, info);
  strcat(tempStr, " : ");
  //infoType == 0 ? (
    //strcat(tempStr, GetFloatStr(value));
  //): (
    //strcat(tempStr, GetIntStr(value));
  //);
  strcat(tempStr, "\r\n");
  tempStr;
);

@slider
//reload: close previous and reopen
!firstLoad ? (
    file_close(noteData);
);
LoadData();
//something=slider1*srate;
slider2 == 1 ?
(
  slider2 = 0; sliderchange(slider2);
);



@block
//blah+=samplesblock;
//play
(play_state == 1) ? (
  //reload data if data file is closed
  //reset current logical time
  noteData == -1? (
    LoadData();
    current = 0;
  );
  //adding current
  //if current 
  inc = samplesblock/srate*(tempo/60) * 4;
  current += inc;
  firstEnter = 1;
  while (!DataIsOver(noteData,arrayCount,dataSize,index)&&(current>=info[index])) (
    info[index + 1] == 1 ? (
      firstEnter ? (
        firstEnter == 0;
        strcpy(#notemsg,GetIntStr(info[index+3]));
        strcpy(#velocitymsg,GetIntStr(info[index+4]));
        strcpy(#onsetmsg,GetFloatStr(info[index]));
        strcpy(#durationmsg, GetIntStr(info[index+5]));
        strcpy(#trackmsg,GetIntStr(info[index+2])); 
      ) : (
        strcat(#notemsg,"\r\n");
        strcat(#notemsg, GetIntStr(info[index+3]));
        strcat(#velocitymsg,"\r\n");
        strcat(#velocitymsg, GetIntStr(info[index+4]));
        strcat(#onsetmsg,"\r\n");
        strcat(#onsetmsg, GetFloatStr(info[index]));
        strcat(#durationmsg,"\r\n");
        strcat(#durationmsg, GetIntStr(info[index+5]));
        strcat(#trackmsg,"\r\n");
        strcat(#trackmsg, GetIntStr(info[index+2]));
      );
      midisend(0,statNoteOn+info[index+2],info[index+3],info[index+4]);
    ) : (
      v = 0;
      //strcat(#msg, " off\ r\n");
      midisend(0,statNoteOff+info[index+2],info[index+3],info[index+4]);
    );
    index+=dataSize;
  );
  //strcat("1", #msg);
) : (
  //stopped
  //close the dataFile
  play_state == 0 ? (
    noteData != -1 ? (
      file_close(noteData);
      noteData = -1;
    );
  );
  channel = 0;
  pitch = 0;
  while (channel < 5) (
    pitch = 0;
    while (pitch < 128) (
      midisend(0, statNoteOff+channel, pitch, 0);
      pitch += 1; 
    );
    channel += 1;
  );
);


@sample
//spl0=spl0;
//spl1=spl1;

@gfx
gfx_w = 200; gfx_h = 400; 
gfx_b = 0.6;
(impbuf_p1==0)?
  (gfx_r = 1; gfx_g = 0.3;):(gfx_r = 0.3; gfx_g = 1;  );
gfx_rect(12,8,96,16); 
(impbuf_p2==0)?
  (gfx_r = 1; gfx_g = 0.3;):(gfx_r = 0.3; gfx_g = 1;  );
gfx_rect(112,8,96,16);
(impbuf_p3==0)?
  (gfx_r = 1; gfx_g = 0.3;):(gfx_r = 0.3; gfx_g = 1;  );
gfx_rect(212,8,96,16);
gfx_rect(312,8,96,16);
gfx_rect(412,8,96,16);

gfx_r = 0.6; gfx_g = 0.4; gfx_b = 1;

gfx_x = 20; gfx_y = 12;
gfx_drawstr("Note");
gfx_x = 120; gfx_y = 12;
gfx_drawstr("Velocity");
gfx_x = 220; gfx_y = 12;
gfx_drawstr("Onset");
gfx_x = 320; gfx_y = 12;
gfx_drawstr("Duration");
gfx_x = 420; gfx_y = 12;
gfx_drawstr("Track");

gfx_x = 20;
gfx_y = 32;
gfx_printf(#notemsg); 
gfx_x = 120;
gfx_y = 32;
gfx_printf(#velocitymsg); 
gfx_x = 220;
gfx_y = 32;
gfx_printf(#onsetmsg);
gfx_x = 320;
gfx_y = 32;
gfx_printf(#durationmsg);
gfx_x = 420;
gfx_y = 32;
gfx_printf(#trackmsg);
