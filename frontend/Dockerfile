FROM node:18.17

WORKDIR /app

# Copy the json files, so it knows all dependencies first. That way I can do Run npm install and copy all other files 
# at the same time
COPY package*.json ./

RUN npm install -g @angular/cli

RUN npm install

COPY . .

EXPOSE 4200

RUN chmod 600 /app/env-to-angular.js

# Run the environment script
RUN node env-to-angular.js

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]