import { Button, Card, Container, Form, ListGroup } from "react-bootstrap";
import { useState } from "react";
import { onJoinGroup } from "../events/click";

import ppongImg from "../assets/pp-animated.gif";

export default function Home() {
  const [playerName, setPlayerName] = useState("");

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center p-0 m-0 w-100 h-100"
    >
      <Card className="shadow bg-dark w-75 w-md-50 h-auto">
        <Card.Header className="d-flex flex-column align-items-center border-secondary p-0">
          <Card.Title className="fw-normal fst- w-100 text-center bg-danger text-light pt-2 pb-2">
            Ping Pong
          </Card.Title>
          <Card.Img src={ppongImg} className="w-50 w-md-25" />
        </Card.Header>

        <Card.Body className="d-flex flex-column justify-content-center align-items-center gap-1 m-auto p-3 pt-4 pb-4">
          <Form
            className="w-100"
            onSubmit={(e) => {
              e.preventDefault();

              onJoinGroup(playerName);
              setPlayerName(() => "");
            }}
          >
            <Form.Group>
              <Form.Label className="bg-dark text-light fw-normal h6">
                Your Name
              </Form.Label>
              <Form.Control
                required
                type="text"
                value={playerName}
                placeholder="Please enter your name :)"
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="outline-dark"
              className="text-dark fw-normal mt-3 border-0 bg-warning w-100"
              type="submit"
            >
              Join Group
            </Button>
          </Form>

          <Card className="w-100 mt-4 border-bottom-0 border-4 border-info bg-dark">
            <Card.Header className="p-0 pt-1 text-light">
              <Card.Title className="text-center fw-normal">
                <p className="lead fst-italic fw-normal text-decoration-underline">
                  How to play?
                </p>
              </Card.Title>
            </Card.Header>

            <Card.Body>
              <ListGroup as="ul">
                <ListGroup.Item variant="success" className="fw-bold">
                  # Move your mouse to control the paddle
                </ListGroup.Item>
                <ListGroup.Item variant="success" className="fw-bold">
                  # Hit the ball to score points
                </ListGroup.Item>
                <ListGroup.Item variant="success" className="fw-bold">
                  # First 5 points wins
                </ListGroup.Item>
                <ListGroup.Item variant="success" className="fw-bold">
                  # You'll be matched with another player
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
}
