                                                              
                                                              
                                                              
                                                  Wed software development project
                                                              

   ![web](https://user-images.githubusercontent.com/64903981/149135888-cb4b52a6-6be5-4ae1-889a-50b23831e75c.png)

    
   The project is build with [DENO](https://deno.land/) backend framework.
   (Open the link for instractions on how to install and use deno)
   
   
   Other technologies used in this project are: 
   PostgreSQL, JS, bootstrap





                                                    Access and CREATE TABLEs


CREATE TABLEs can be found in root folder of the application.                               

The address at which the application can currently be accessed: 
                                                      
******CAUTION*******   ---> Not optomized

                                                      
                                                      
   [HERE](https://wsdprojectbyfzy.herokuapp.com/) 




                                                Guide on how to run the application

                                                      Running from .env file



 Env file is used for running the application locally. You can find the .env file in the root folder 
 of the application. By default, my own test DB is set there. Open the file and replace the given HOST, 
 PASSWORD and USER values with yours.





                                                        How to run tests


 To run tests you have to set TEST_ENVIRONMENT to something, for example to true. 

                       
TEST_ENVIRONMENT=true deno test --unstable --allow-all 
                        
