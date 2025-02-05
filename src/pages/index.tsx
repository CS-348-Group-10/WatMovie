import { Typography, Container } from "@mui/material"

export default function Home() {
    return (
        <Container>
            <Typography variant="h1">
                Welcome to WatMovie!
            </Typography>
            <Typography variant="body1">
                This is a movie database website where you can search for movies and view their details.
            </Typography>
        </Container>
    );
}
