CREATE OR REPLACE FUNCTION update_user_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- If a review is inserted, add its rating to the sum and increment the count
    IF TG_OP = 'INSERT' THEN
        UPDATE movies
        SET user_rating_sum = user_rating_sum + NEW.rating,
            user_rating_count = user_rating_count + 1
        WHERE mid = NEW.mid;

    -- If a review is updated, adjust the sum by subtracting old rating and adding new one
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE movies
        SET user_rating_sum = user_rating_sum - OLD.rating + NEW.rating
        WHERE mid = NEW.mid;

    -- If a review is deleted, subtract its rating from the sum and decrement the count
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE movies
        SET user_rating_sum = user_rating_sum - OLD.rating,
            user_rating_count = user_rating_count - 1
        WHERE mid = OLD.mid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_ratings_trigger'
    ) THEN
        CREATE TRIGGER update_user_ratings_trigger
        AFTER INSERT OR UPDATE OR DELETE ON user_reviews
        FOR EACH ROW 
        EXECUTE FUNCTION update_user_ratings();
    END IF;
END $$;