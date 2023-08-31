#include <errno.h>
#include <string.h>
#include <unistd.h>
#include <netdb.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/select.h>


char read_buffer[4001];
char write_buffer[4001];
char *msgs[70000];
int ids[70000];
int max_fd = 0;
int count = 0;

fd_set rfds, wfds, afds;

void fatal_error()
{
	write(2, "Fatal error\n", 12);
	exit(1);
}

int extract_message(char **buf, char **msg)
{
	char	*newbuf;
	int	i;

	*msg = 0;
	if (*buf == 0)
		return (0);
	i = 0;
	while ((*buf)[i])
	{
		if ((*buf)[i] == '\n')
		{
			newbuf = calloc(1, sizeof(*newbuf) * (strlen(*buf + i + 1) + 1));
			if (newbuf == 0)
				return (-1);
			strcpy(newbuf, *buf + i + 1);
			*msg = *buf;
			(*msg)[i + 1] = 0;
			*buf = newbuf;
			return (1);
		}
		i++;
	}
	return (0);
}

char *str_join(char *buf, char *add)
{
	char	*newbuf;
	int		len;

	if (buf == 0)
		len = 0;
	else
		len = strlen(buf);
	newbuf = malloc(sizeof(*newbuf) * (len + strlen(add) + 1));
	if (newbuf == 0)
		return (0);
	newbuf[0] = 0;
	if (buf != 0)
		strcat(newbuf, buf);
	free(buf);
	strcat(newbuf, add);
	return (newbuf);
}

void notify_clients(int author, char *msg)
{
	for(int fd = 0; fd <= max_fd; fd++)
	{
		if(FD_ISSET(fd, &wfds) && author != fd)
			send(fd, msg, strlen(msg), 0);
	}
}

void add_client(int fd)
{
	if(fd > max_fd)
		max_fd = fd;
	ids[fd] = count++;
	msgs[fd] = NULL;
	FD_SET(fd, &afds);
	sprintf(write_buffer, "server: client %d just arrived\n", ids[fd]);
	notify_clients(fd, write_buffer);

}

void remove_client(int fd)
{
	sprintf(write_buffer, "server: client %d just left\n" , ids[fd]);
	notify_clients(fd, write_buffer);
	FD_CLR(fd, &afds);
	if(msgs[fd])
		free(msgs[fd]);
	close(fd);
}

void send_msg(int fd)
{
	char *msg = NULL;
	
	while(extract_message(&msgs[fd], &msg) == 1)
	{
		sprintf(write_buffer, "client %d: ", ids[fd]);
		notify_clients(fd, write_buffer);
		notify_clients(fd, msg);
		free(msg);
	}
}

int main(int argc, char **argv) {

	if(argc != 2){
		write(2, "Wrong number of arguments\n", 26);
		exit(1);
	}

	int server_fd;
	struct sockaddr_in servaddr; 

 
	server_fd = socket(AF_INET, SOCK_STREAM, 0); 
	if (server_fd < 0)
		fatal_error();
	bzero(&servaddr, sizeof(servaddr)); 

	servaddr.sin_family = AF_INET; 
	servaddr.sin_addr.s_addr = htonl(2130706433); //127.0.0.1
	servaddr.sin_port = htons(atoi(argv[1])); 
  
	if ((bind(server_fd, (const struct sockaddr *)&servaddr, sizeof(servaddr))) != 0)
		fatal_error();
	if (listen(server_fd, 1024) != 0) 
		fatal_error();

	max_fd = server_fd;
	FD_ZERO(&afds);
	FD_SET(server_fd, &afds);

	while(1)
	{
		wfds = rfds = afds;
		
		if(select(max_fd + 1, &rfds, &wfds, NULL, NULL) < 0)
			fatal_error();
		
		for(int fd = 0; fd <= max_fd; fd++)
		{
			if(!FD_ISSET(fd, &rfds))
				continue;
			
			if(server_fd == fd)
			{
				//add client
				unsigned int len = sizeof(servaddr);
				int client_fd = accept(server_fd, (struct sockaddr *)&servaddr, &len);
				if(client_fd >= 0)
				{
					add_client(client_fd);
					break;
				}
			}
			else
			{
			printf("Called");
				int bytes_read = recv(fd, read_buffer, 4000, 0);
				
				if(bytes_read <= 0)
				{
					remove_client(fd);
					break;
				}
				read_buffer[bytes_read] = 0;
				msgs[fd] = str_join(msgs[fd], read_buffer);
				printf("Called");
				send_msg(fd);
			}
		
		}
	}
}
