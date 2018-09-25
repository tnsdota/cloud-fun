import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


admin.initializeApp()

// // // Start writing Firebase Functions
// // // https://firebase.google.com/docs/functions/typescript

// // All society APIs 
// //working



export const createSociety = functions.https.onRequest((request, response) => {

    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')

    const db = admin.database();
    const Ref = db.ref("/societies");

    console.log("asdsad")
    // to find number of children of societies node in database and generate unique key for next society
    Ref.once("value",function(snap){
        const obj = snap.val();
        //let count = 0;
        let maximum = 0;
        for(const cnt in obj){
            console.log(cnt);
            if(parseInt(cnt)>maximum){
                maximum = parseInt(cnt);
            }
        }
         //get society count and convert it to string
        const society_count = maximum+1;
        const society_count_string =society_count+'';


        const inpaddress = request.query.address;
        const inpcontact = request.query.contact;
        const inpemail = request.query.email;
        const inpfacilities = request.query.facilities; //boolean yes/no
        const inpnotices = request.query.notices; //boolean yes/no
        const inplogo = '/tmpurl';  //upload image and get url
        const inpname = request.query.name;


        const getuniqueID = society_count_string;  
        console.log(getuniqueID)
        

        const societyObject = {
            displayName: inpname,
            email: inpemail,
            address: inpaddress,
            contact: inpcontact,
            services: {
                notices: inpnotices,
                facilities: inpfacilities
            },
            logo: inplogo,
            societyID: getuniqueID

        };

        Ref.child(getuniqueID).update(societyObject)
        .then(function(){
            console.log("hello");
            response.status(200).send("success");
        })
        .catch(function(error){
            console.log(error);
        })


    })
    .then(function(){
        console.log("success");
    })
    .catch(function(error){
        console.log(error);
    })
    


 });


 
// working
export const getSociety = functions.https.onRequest((request, response) => {

    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const socID = request.query.societyID;
    const db = admin.database();
    const SocietyRef = db.ref("/societies/"+socID);

    SocietyRef.once('value')
    .then(function(snap){
        console.log(snap.val())
        if(snap.val()===null){
            response.status(200).send("Society not found");
            // response.status(200).json({Society: snap.val()});
        }
        else{
            response.status(200).json({Society: snap.val()});

        }
    })
    .catch(function(error){
        console.log(error.code);
    })


 });

//deletes society by it's ID
export const deleteSociety = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const socID = request.query.societyID;
    const db = admin.database();
    const SocietyRef = db.ref("/societies");

   SocietyRef.once('value',function(snap){
        if(snap.hasChild(socID)){
            SocietyRef.child(socID).remove()
            .then(function(success){
                response.status(200).send("successfully removed");
            })
            .catch(function(error){
                console.log(error);
            })
        }
        else{
            response.status(200).send("Society not found");
        }
    })
    .then(function(){
        console.log("success");
    })
    .catch(function(error){
        console.log(error);
    })


 });

//  //update society
export const updateSociety = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const updateObject = request.query;
    const socID = request.query.societyID;

    const db = admin.database();
    const Ref = db.ref("/societies");

    Ref.once('value',function(snap){
        if(snap.hasChild(socID)){
            Ref.child(socID).update(updateObject)
            .then(function(){
                response.status(200).send("success");
            })
            .catch(function(error){
                console.log(error)
            })
        }
        else{
            response.status(200).send("Society not found");
        }
    })
    .then(function(){
        console.log("success");
    })
    .catch(function(error){
        console.log(error);
    })
    

    
    

 });


// All notices APIs
// get all notices of a particular society
export const getNotices = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const socID = request.query.societyID;
    const db = admin.database();
    const NoticesRef = db.ref("/notices/"+socID);

    NoticesRef.once('value')
    .then(function(snap){
        console.log(snap.val())
        response.status(200).json({Notices: snap.val()});
    })
    .catch(function(error){
        console.log(error.code);
    })


 });

 //get a notices of a particular society using date
export const getNoticeByDate = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const date = request.query.date;
    const socID = request.query.societyID;
    const db = admin.database();
    const MembersRef = db.ref("/notices").child(socID).orderByChild('date').equalTo(date);

    MembersRef.on("value",function(snap){
        //console.log(snap.val());
        if(snap.val()===null){
            response.status(200).send('no notices for this date');

        }
        else{
            response.status(200).json({notice: snap.val()});
        }
    })

 });


// datetime is short for date and time both the parameters of the notice
// onlydate is used for setting only the date


export const createNotice = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const ipdatetime = request.query.datetime+""; //date time object with clients date and time
    //const description = request.query.description;
    //const pic = request.query.pic; //URL of the pic uploaded in firebase storage
    //const readreceipt = request.query.readreceipt; //tmp
    const ipsubject = request.query.subject+""; //subject of the notice
    //const type = request.query.type; // tenant/admin/owner
    //const onlydate = request.query.onlydate;
    const iptenant = request.query.tenant+"";
    const ipowner = request.query.owner+"";
    const socID = request.query.societyID+"";
    const db = admin.database();
    const NoticesRef = db.ref("/notices/"+socID);
    //console.log("NoticesRef",NoticesRef);

    //console.log((ipdatetime),ipowner,socID,iptenant,ipsubject);
    //ipdatetime = ipdatetime+"";
    //console.log(typeof(ipdatetime),typeof(ipowner),typeof(socID),typeof(iptenant),typeof(ipsubject));

    const noticesObject = {
        subject: ipsubject,
        date: ipdatetime,
        tenant: iptenant,
        owner: ipowner
    };
    //console.log(noticesObject);


    NoticesRef.child(ipdatetime).update(noticesObject)
    .then(function(){
        response.status(200).send("success");
    })
    .catch(function(error){
        console.log(error)
    })
 });


export const updateNotice = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const datetime = request.query.datetime; //date time object with clients date and time, edit "datetime" to "request.query.datetime"
    //const query = request.query; //entire json object of the notice which you want to update
    const socID = request.query.societyID;
    const db = admin.database();
    const NoticesRef = db.ref("/notices/"+socID);
    console.log("updated")
    const updateObject = {};

    //const datetime = request.query.datetime; //date time object with clients date and time
    const description = request.query.description;
    const pic = request.query.pic; //URL of the pic uploaded in firebase storage
    const readreceipt = request.query.readreceipt; //tmp
    const subject = request.query.subject; //subject of the notice
    const type = request.query.type; // tenant/admin/owner
    const onlydate = request.query.onlydate;

    if(description){
        updateObject["description"] = description;

    }
    if(pic){
        updateObject["pic"] = pic;

    }
    if(readreceipt){
        updateObject["readreceipt"] = readreceipt;
    }
    if(subject){
        updateObject["subject"] = subject;
    }
    if(type){
        updateObject["type"] = type;
    }
    if(onlydate){
        updateObject["date"] = onlydate;
    }
   



    NoticesRef.child(datetime).update(updateObject)
    .then(function(){
        response.status(200).send("success");
    })
    .catch(function(error){
        console.log(error)
    })


 });

 //deletion of notice by date and time of the notice
 export const deleteNotice = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const datetime = request.query.datetime; //date time object with clients date and time, edit "datetime" to "request.query.datetime"
    const socID = request.query.societyID;
    const db = admin.database();
    const NoticesRef = db.ref("/notices/"+socID);

    NoticesRef.child(datetime).remove()
    .then(function(){
        response.status(200).send("successfully removed");
    })
    .catch(function(error){
        console.log(error);
    })

 });





// // All member APIs
// /*Fetch list of all the members in a particular society. The societyId is passed via the url*/
export const getMembers = functions.https.onRequest((request,response) => {


    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')

    const db = admin.database();


    const socID = request.query.societyID;
    const Membersref = db.ref("/Members/"+socID);
    
    Membersref.once('value',(snapshot) => {
        response.status(200).json({member: snapshot.val()});
    })
    .then(function(){
        console.log("success");
    })
    .catch(function(error){
        console.log(error);
    })
  });

//   /*The createMember routine will enable the admin to create a new member in a particular society
//   MainDB
//     |-Members
//         |-societyID
//             |-New member added here
            
//     all the data parameters are passed via the url. System generated key used*/ 
export const createMember = functions.https.onRequest((request,response) =>{
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
//>societyID should be queried.currently hardcoded
    const socID = request.query.societyID;
    const Membersref = db.ref("/Members/"+socID);

    const email = request.query.email;
    const name  = request.query.name;
    const contact = request.query.contact;
    const flatno = request.query.flatno;
    const type = request.query.type;
    //const key = Membersref.push().key;
    const MemberObject = {
        email: email,
        name: name,
        contact: contact,
        flatno: flatno,
        type: type,
        notices: true,
        facilities: true,
        applications: true
    };
    Membersref.push(MemberObject).then(function(){
        response.status(200).send("success");
    })
  });

// /*updateMember will update the member data. All the data passed via the url. Also, system generated key
//  currently required to update data.
// */   
  export const updateMember = functions.https.onRequest((request,response) =>{
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const socID = request.query.societyID;
    const db = admin.database();
//societyID should be queried.currently hardcoded
    const key = request.query.key;
    const Membersref = db.ref("/Members/"+socID+"/" + key + "/");

    console.log("/Members/"+socID+"/" + key + "/");

    const email = request.query.email;
    const name  = request.query.name;
    const contact = request.query.contact;
    const flatno = request.query.flatno;
    const type = request.query.type;
   // const key = Membersref.push().key;
    const MemberObject = {
        email: email,
        name: name,
        contact: contact,
        flatno: flatno,
        type: type,
        notices: true,
        facilities: true,
        applications: true
    };
    Membersref.update(MemberObject).then(function(){
        response.status(200).send("success");
    })
    .catch(() => {
        response.status(200).send("failure");
    })
  });


export const searchMember = functions.https.onRequest((request,response) =>{
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')

    const socID = request.query.societyID;
    const email = request.query.email;
    const contact = request.query.contact;
    const name = request.query.name;
    const flatno = request.query.flatno;

    const db = admin.database();

    //if email ID is sent in request
    if(email){
        const MemberRef = db.ref("/Members/").child(socID).orderByChild('email').equalTo(email);

        MemberRef.once('value',function(snap){
            if(snap.val()){
                response.status(200).json({member:snap.val()});
            }
            else{
                response.status(200).json({member:null});
            }
        })
        
        .then(function(){
            console.log("success")

        })
        .catch(function(error){
            console.log(error)
        })
    }

    //if contact is sent in request
    else if(contact){
        const MemberRef = db.ref("/Members/").child(socID).orderByChild('contact').equalTo(contact);

        MemberRef.once('value',function(snap){
            if(snap.val()){
                response.status(200).json({member:snap.val()});
            }
            else{
                response.status(200).json({member:null});
            }
        })
        
        .then(function(){
            console.log("success")
        })
        .catch(function(error){
            console.log(error)
        }) 
    }

    //if name is sent in request
    else if(name){
        const MemberRef = db.ref("/Members/").child(socID).orderByChild('name').equalTo(name);

        MemberRef.once('value',function(snap){
            if(snap.val()){
                response.status(200).json({member:snap.val()});
            }
            else{
                response.status(200).json({member:null});
            }
        })
        
        .then(function(){
            console.log("success")
        })
        .catch(function(error){
            console.log(error)
        }) 
    }

    else if(flatno){
        const MemberRef = db.ref("/Members/").child(socID).orderByChild('flatno').equalTo(flatno);

        MemberRef.once('value',function(snap){
            if(snap.val()){
                response.status(200).json({member:snap.val()});
            }
            else{
                response.status(200).json({member:null});
            }
        })
        
        .then(function(){
            console.log("success")
        })
        .catch(function(error){
            console.log(error)
        }) 
    }
    

})


// Delete Member
export const deleteMember = functions.https.onRequest((request,response) => {


    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const socID = request.query.societyID;
    const key = request.query.key;

    const db = admin.database();
    const MemberRef = db.ref("/Members/"+socID);

   MemberRef.once('value',function(snap){
        if(snap.hasChild(key)){
            MemberRef.child(key).remove()
            .then(function(success){
                response.status(200).send("successfully removed");
            })
            .catch(function(error){
                console.log(error);
            })
        }
        else{
            response.status(200).send("Society not found");
        }
    })
    .then(function(){
        console.log("success");
    })
    .catch(function(error){
        console.log(error);
    })

});

// //All facilities API
// /*
// createFacility enables to create a new Facility under a particular society
// MainDB
//     |-facilities
//         |-societyID
//             |-New facility added here
// */
export const createFacility = functions.https.onRequest((request,response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
    const societyid = request.query.societyid;
    const facilityName = request.query.facilityname;
    const bookAfterUse = request.query.bafu;
    const breakTimePerSlot = request.query.btps;
    const closingHours = request.query.ch;
    const currentStatus = request.query.cs;
    const isBookable = request.query.bookable;
    const openingHours = request.query.oh;
    const sessionTime = request.query.st;
    const advanceBookingFrom = request.query.abf;
    const facilities = db.ref("/facilities/" + societyid + "/" + facilityName);
    const facilityObject = {
        book_after_use: bookAfterUse,
        break_time_per_slot: breakTimePerSlot,
        closing_hours: closingHours,
        current_status: currentStatus,
        isbookable: isBookable,
        opening_hours: openingHours,
        session_time: sessionTime,
        to_open_before: advanceBookingFrom
    };
    facilities.set(facilityObject)

    .then(function(){
        response.status(200).send("success");
    })

    .catch(() => {
        response.status(200).send("failure");
    })
  });



export const searchFacility = functions.https.onRequest((request,response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
    const facilities = db.ref("/facilities/");
    const societyId = request.query.societyid;
    const facilityName = request.query.facilityname;
    var flag = false;
    var flag1 = false;

    facilities.on('value',(snapshot)=>{
            flag = snapshot.forEach((childSnapShot) => {
                if(childSnapShot.key === societyId){
                    flag1 = childSnapShot.forEach((childSnapShot1) => {
                        if(childSnapShot1.key === facilityName){
                            response.status(200).send(childSnapShot1.val());
                            return true;
                        }
                        return false;
                    });
                    if(!flag1){
                        response.status(200).send("Facility not found");
                    }
                    return true;
                }
                return false;
            })
            if(!flag){
                response.status(200).send("SocietyId not found");
            }
    });

});
// /*
// checks if facility to be updated already exists and returns true and false
//  accordingly updates if facility exists
// */
export const updateFacility = functions.https.onRequest((request,response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
    const societyId = request.query.societyid;
    const facilityName = request.query.facilityname;
    const bookAfterUse = request.query.bafu;
    const breakTimePerSlot = request.query.btps;
    const closingHours = request.query.ch;
    const currentStatus = request.query.cs;
    const isBookable = request.query.bookable;
    const openingHours = request.query.oh;
    const sessionTime = request.query.st;
    const advanceBookingFrom = request.query.abf;
    const facilities = db.ref("/facilities/"+societyId+"/"+facilityName);
    const facilityObject = {
        book_after_use: bookAfterUse,
        break_time_per_slot: breakTimePerSlot,
        closing_hours: closingHours,
        current_status: currentStatus,
        isbookable: isBookable,
        opening_hours: openingHours,
        session_time: sessionTime,
        to_open_before: advanceBookingFrom
    };
    facilities.set(facilityObject)

    .then(function(){
        response.status(200).send("success");
    })

    .catch(() => {
        response.status(200).send("failure");
    })
  });

  export const deleteFacility = functions.https.onRequest((request,response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
    const societyId = request.query.societyid;
    const facilityName = request.query.facilityname;
    const facilities = db.ref("/facilities/" + societyId + "/" + facilityName);
    facilities.remove()
    .then(function(success){
        response.status(200).send("successfully removed");
    })
    .catch(function(error){
        console.log(error);
    })
  });


export const getFacilities = functions.https.onRequest((request,response) => {
    response.set('Access-Control-Allow-Origin', "*")
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    const db = admin.database();
    const facilities = db.ref("/facilities/");

    const societyId = request.query.societyid;
    let flag = false;

    facilities.on('value',(snapshot) => {
        flag = snapshot.forEach((childsnapshot) => {
            if(childsnapshot.key === societyId){
                response.status(200).send(childsnapshot.val());
                return true;
            }
            else{
                return false;
            }
        });
        if(!flag){
            response.status(200).send("society Id not found");
        }
    });
    
});





// Storage Trigger for CSV file upload
export const addMembersViaCSV = functions.storage.object().onFinalize((object) => {
    console.log("hello");
    console.log(object.bucket);
    console.log(object);
    const downloadURL = object.name;

    const stor = admin.storage().bucket().file(downloadURL).download()

    .then(function(){
        console.log(stor);
    })

    .catch(function(error){
        console.log("error", stor);
    })

    //const pathReference = stor.ref(downloadURL);
    


});